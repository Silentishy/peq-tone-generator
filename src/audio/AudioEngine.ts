import { BenchmarkTrackId, EQFix, ToneMode } from '../types/audio';
import { calculateEqualLoudnessGain, calculateCombinedFilterResponse, MIN_FREQ, MAX_FREQ } from '../utils/eqMath';

export interface MusicState {
  isLoaded: boolean;
  isPlaying: boolean;
  fileName: string;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  isBenchmark: boolean;
}

/**
 * Encode an AudioBuffer into an in-memory 16-bit PCM Stereo WAV Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true);  // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and write 16-bit PCM samples
  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    let sL = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;

    // Right channel
    let sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private preampGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  public analyser: AnalyserNode | null = null;

  // Dedicated stereo intermediate bus ensuring both ears get sound
  private stereoBus: GainNode | null = null;
  private sourceGain: GainNode | null = null;

  // Tone generation: Pure Sine or Narrowband Pink Noise
  private toneMode: ToneMode = 'sine';
  private oscNode: OscillatorNode | null = null;
  private noiseSourceNode: AudioBufferSourceNode | null = null;
  private noiseBandpassNode: BiquadFilterNode | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private toneCompensationGain: GainNode | null = null;
  private isEqualLoudnessEnabled: boolean = false;

  // Music audio player & benchmark tracks
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private musicFileName: string = '';
  private isBenchmarkTrack: boolean = false;
  private isMusicLooping: boolean = true;
  private isMusicPlaying: boolean = false;
  private onMusicStateChange?: (state: MusicState) => void;

  // Filter chain
  private filterNodes: Map<string, BiquadFilterNode> = new Map();
  private filterInputNode: GainNode | null = null;
  private filterOutputNode: GainNode | null = null;

  // State
  private isRunning: boolean = false; // Tone state
  private isBypassed: boolean = false; // A/B compare
  private volume: number = 0.25; // Safe default volume
  private preampOffset: number = 0; // Preamp in dB
  private frequency: number = 1000;
  private currentFixes: EQFix[] = [];

  // Auto-scan / Frequency walker
  private isAutoScanning: boolean = false;
  private scanSpeed: 'slow' | 'normal' | 'fast' = 'normal';
  private scanRafId: number | null = null;
  private lastScanTime: number = 0;
  private onFrequencyChange?: (freq: number) => void;

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
      try {
        AudioEngine.instance.initContext();
      } catch {}
    }
    return AudioEngine.instance;
  }

  private initContext() {
    if (this.ctx) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Master Output with safety limiter to protect ears from loud peaks
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(6, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.08, this.ctx.currentTime);

    this.preampGain = this.ctx.createGain();
    this.preampGain.gain.setValueAtTime(Math.pow(10, this.preampOffset / 20), this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // 2. Real-time Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.85;

    // 3. Stereo enforcement bus (guarantees both Left & Right channels play evenly)
    this.stereoBus = this.ctx.createGain();
    this.stereoBus.channelCount = 2;
    this.stereoBus.channelCountMode = 'explicit';
    this.stereoBus.channelInterpretation = 'speakers';

    // 4. Source & Filter stages
    this.sourceGain = this.ctx.createGain();
    this.sourceGain.channelCount = 2;
    this.sourceGain.channelCountMode = 'explicit';
    this.sourceGain.channelInterpretation = 'speakers';
    this.sourceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.toneCompensationGain = this.ctx.createGain();
    this.toneCompensationGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.filterInputNode = this.ctx.createGain();
    this.filterInputNode.channelCount = 2;
    this.filterInputNode.channelCountMode = 'explicit';
    this.filterInputNode.channelInterpretation = 'speakers';

    this.filterOutputNode = this.ctx.createGain();
    this.filterOutputNode.channelCount = 2;
    this.filterOutputNode.channelCountMode = 'explicit';
    this.filterOutputNode.channelInterpretation = 'speakers';

    // Graph:
    // [Sources] -> sourceGain -> filterInputNode -> [Filters] -> filterOutputNode -> stereoBus -> analyser -> preampGain -> masterGain -> limiter -> Speakers
    this.sourceGain.connect(this.filterInputNode);
    this.filterOutputNode.connect(this.stereoBus);
    this.stereoBus.connect(this.analyser);
    this.analyser.connect(this.preampGain);
    this.preampGain.connect(this.masterGain);
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);

    // Pre-render pink noise buffer for narrowband noise mode
    this.generatePinkNoiseBuffer();

    // Initialize media player element connected to Web Audio graph
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = this.isMusicLooping;
      this.audioElement.crossOrigin = 'anonymous';

      this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.mediaSourceNode.connect(this.sourceGain);

      this.audioElement.addEventListener('timeupdate', () => this.notifyMusicState());
      this.audioElement.addEventListener('loadedmetadata', () => this.notifyMusicState());
      this.audioElement.addEventListener('play', () => {
        this.isMusicPlaying = true;
        this.notifyMusicState();
      });
      this.audioElement.addEventListener('pause', () => {
        this.isMusicPlaying = false;
        this.notifyMusicState();
      });
      this.audioElement.addEventListener('ended', () => {
        this.isMusicPlaying = false;
        this.notifyMusicState();
      });
    }
  }

  // --- Noise Buffer Generation (Paul Kellet's refined 1/f filter) ---
  private generatePinkNoiseBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 5; // 5-second seamless buffer

    this.pinkNoiseBuffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = this.pinkNoiseBuffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
        b6 = white * 0.115926;
      }
    }
  }

  // --- Start / Stop Pure Tone or Narrowband Noise ---
  public async start(): Promise<void> {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Pause music if currently playing so tone is clean and audible
    if (this.isMusicPlaying) {
      this.pauseMusic();
    }

    this.startToneSource();
    this.rebuildFilterChain(this.currentFixes);
    this.updateEqualLoudnessGain(false);

    this.isRunning = true;
  }

  public stop(): void {
    if (!this.ctx || !this.isRunning) return;

    this.stopAutoScan();
    this.stopToneSource();
    this.isRunning = false;
  }

  public toggle(): Promise<void> | void {
    if (this.isRunning) {
      this.stop();
    } else {
      return this.start();
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsAnyAudioPlaying(): boolean {
    return this.isRunning || this.isMusicPlaying;
  }

  // --- Tone Mode: Pure Sine or Narrowband Noise ---
  public setToneMode(mode: ToneMode) {
    this.toneMode = mode;
    if (this.isRunning) {
      this.startToneSource();
    }
  }

  public getToneMode(): ToneMode {
    return this.toneMode;
  }

  private startToneSource() {
    if (!this.ctx || !this.sourceGain || !this.toneCompensationGain) return;
    this.stopToneSource();

    const now = this.ctx.currentTime;

    if (this.toneMode === 'sine') {
      this.oscNode = this.ctx.createOscillator();
      this.oscNode.type = 'sine';
      this.oscNode.frequency.setValueAtTime(this.frequency, now);

      this.oscNode.connect(this.toneCompensationGain);
      this.toneCompensationGain.connect(this.sourceGain);
      this.oscNode.start(now);
    } else {
      // Narrowband Pink Noise Mode (ideal for room speakers without standing wave spikes)
      if (this.pinkNoiseBuffer) {
        this.noiseSourceNode = this.ctx.createBufferSource();
        this.noiseSourceNode.buffer = this.pinkNoiseBuffer;
        this.noiseSourceNode.loop = true;

        this.noiseBandpassNode = this.ctx.createBiquadFilter();
        this.noiseBandpassNode.type = 'bandpass';
        this.noiseBandpassNode.frequency.setValueAtTime(this.frequency, now);
        this.noiseBandpassNode.Q.setValueAtTime(4.0, now); // Narrow bandpass

        this.noiseSourceNode.connect(this.noiseBandpassNode);
        this.noiseBandpassNode.connect(this.toneCompensationGain);
        this.toneCompensationGain.connect(this.sourceGain);
        this.noiseSourceNode.start(now);
      }
    }
  }

  private stopToneSource() {
    if (this.oscNode) {
      try {
        this.oscNode.stop();
        this.oscNode.disconnect();
      } catch {}
      this.oscNode = null;
    }
    if (this.noiseSourceNode) {
      try {
        this.noiseSourceNode.stop();
        this.noiseSourceNode.disconnect();
      } catch {}
      this.noiseSourceNode = null;
    }
    if (this.noiseBandpassNode) {
      try {
        this.noiseBandpassNode.disconnect();
      } catch {}
      this.noiseBandpassNode = null;
    }
  }

  // --- Equal-Loudness Normalization (ISO 226) ---
  public setEqualLoudness(enabled: boolean) {
    this.isEqualLoudnessEnabled = enabled;
    this.updateEqualLoudnessGain(true);
  }

  public getIsEqualLoudness(): boolean {
    return this.isEqualLoudnessEnabled;
  }

  private updateEqualLoudnessGain(smooth = true) {
    if (!this.ctx || !this.toneCompensationGain) return;
    const now = this.ctx.currentTime;

    if (!this.isEqualLoudnessEnabled) {
      if (smooth) {
        this.toneCompensationGain.gain.setTargetAtTime(1.0, now, 0.02);
      } else {
        this.toneCompensationGain.gain.setValueAtTime(1.0, now);
      }
      return;
    }

    const compDb = calculateEqualLoudnessGain(this.frequency);
    const linearGain = Math.pow(10, compDb / 20);

    if (smooth) {
      this.toneCompensationGain.gain.setTargetAtTime(linearGain, now, 0.02);
    } else {
      this.toneCompensationGain.gain.setValueAtTime(linearGain, now);
    }
  }

  // --- Frequency Control ---
  public setFrequency(freq: number, smooth = true) {
    const clampedFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
    this.frequency = clampedFreq;

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.oscNode) {
        if (smooth) {
          this.oscNode.frequency.setTargetAtTime(clampedFreq, now, 0.015);
        } else {
          this.oscNode.frequency.setValueAtTime(clampedFreq, now);
        }
      }

      if (this.noiseBandpassNode) {
        if (smooth) {
          this.noiseBandpassNode.frequency.setTargetAtTime(clampedFreq, now, 0.015);
        } else {
          this.noiseBandpassNode.frequency.setValueAtTime(clampedFreq, now);
        }
      }

      this.updateEqualLoudnessGain(smooth);
    }

    if (this.onFrequencyChange) {
      this.onFrequencyChange(clampedFreq);
    }
  }

  public getFrequency(): number {
    return this.frequency;
  }

  public setFrequencyCallback(cb: (freq: number) => void) {
    this.onFrequencyChange = cb;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1.0, vol));
    this.volume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- Headroom & Preamp ---
  public setPreamp(preampDb: number) {
    this.preampOffset = preampDb;
    if (this.preampGain && this.ctx) {
      const linear = Math.pow(10, preampDb / 20);
      this.preampGain.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.02);
    }
  }

  public getPreamp(): number {
    return this.preampOffset;
  }

  // --- A/B Compare Toggle ---
  public setBypass(bypass: boolean) {
    this.isBypassed = bypass;
    this.rebuildFilterChain(this.currentFixes);
  }

  public getIsBypassed(): boolean {
    return this.isBypassed;
  }

  // --- Filter Bank Management ---
  public rebuildFilterChain(fixes: EQFix[]) {
    this.currentFixes = [...fixes];
    if (!this.ctx || !this.filterInputNode || !this.filterOutputNode) return;

    this.filterInputNode.disconnect();
    this.filterNodes.forEach((node) => node.disconnect());
    this.filterNodes.clear();

    const activeFixes = this.isBypassed
      ? []
      : fixes.filter((f) => f.enabled && f.gain !== 0);

    if (activeFixes.length === 0) {
      this.filterInputNode.connect(this.filterOutputNode);
      return;
    }

    let previousNode: AudioNode = this.filterInputNode;

    activeFixes.forEach((fix) => {
      if (!this.ctx) return;
      const node = this.ctx.createBiquadFilter();
      node.channelCount = 2;
      node.channelCountMode = 'explicit';
      node.channelInterpretation = 'speakers';
      node.type = fix.filterType || 'peaking';
      node.frequency.setValueAtTime(fix.frequency, this.ctx.currentTime);
      node.gain.setValueAtTime(fix.gain, this.ctx.currentTime);
      node.Q.setValueAtTime(fix.q, this.ctx.currentTime);

      this.filterNodes.set(fix.id, node);
      previousNode.connect(node);
      previousNode = node;
    });

    previousNode.connect(this.filterOutputNode);
  }

  public updateLiveFix(fix: EQFix) {
    const node = this.filterNodes.get(fix.id);
    if (!node || !this.ctx || this.isBypassed) {
      this.rebuildFilterChain(this.currentFixes);
      return;
    }

    const now = this.ctx.currentTime;
    node.type = fix.filterType || 'peaking';
    node.frequency.setTargetAtTime(fix.frequency, now, 0.015);
    node.gain.setTargetAtTime(fix.gain, now, 0.015);
    node.Q.setTargetAtTime(fix.q, now, 0.015);
  }

  // --- Frequency Response for Canvas Graph ---
  public getCombinedFrequencyResponse(
    fixes: EQFix[],
    freqPoints: Float32Array
  ): Float32Array {
    if (this.isBypassed) {
      return new Float32Array(freqPoints.length).fill(0.0);
    }
    const sampleRate = this.ctx?.sampleRate || 48000;
    return calculateCombinedFilterResponse(fixes, freqPoints, sampleRate);
  }

  // --- Auto-Scan / Frequency Walker ---
  public startAutoScan(speed: 'slow' | 'normal' | 'fast' = 'normal') {
    this.scanSpeed = speed;
    this.isAutoScanning = true;
    this.lastScanTime = performance.now();
    if (!this.isRunning) {
      this.start();
    }
    this.runScanLoop();
  }

  public stopAutoScan() {
    this.isAutoScanning = false;
    if (this.scanRafId) {
      cancelAnimationFrame(this.scanRafId);
      this.scanRafId = null;
    }
  }

  public getIsAutoScanning(): boolean {
    return this.isAutoScanning;
  }

  private runScanLoop = () => {
    if (!this.isAutoScanning) return;

    const now = performance.now();
    const dt = (now - this.lastScanTime) / 1000;
    this.lastScanTime = now;

    // Speeds in octaves per second
    const octavesPerSec =
      this.scanSpeed === 'slow' ? 0.15 : this.scanSpeed === 'normal' ? 0.35 : 0.7;

    // Exponential/logarithmic frequency progression
    let nextFreq = this.frequency * Math.pow(2, octavesPerSec * dt);
    if (nextFreq >= MAX_FREQ) {
      nextFreq = MIN_FREQ; // Loop back to 20 Hz
    }

    this.setFrequency(Math.round(nextFreq * 10) / 10, true);
    this.scanRafId = requestAnimationFrame(this.runScanLoop);
  };

  // --- Music Upload & Audition Player Engine ---
  public setMusicStateCallback(cb: (state: MusicState) => void) {
    this.onMusicStateChange = cb;
  }

  private notifyMusicState() {
    if (this.onMusicStateChange && this.audioElement) {
      this.onMusicStateChange({
        isLoaded: !!this.musicFileName,
        isPlaying: this.isMusicPlaying,
        fileName: this.musicFileName,
        currentTime: this.audioElement.currentTime || 0,
        duration: this.audioElement.duration || 0,
        isLooping: this.isMusicLooping,
        isBenchmark: this.isBenchmarkTrack,
      });
    }
  }

  public loadMusicFile(file: File): void {
    this.initContext();
    this.musicFileName = file.name;
    this.isBenchmarkTrack = false;
    const url = URL.createObjectURL(file);
    if (this.audioElement) {
      this.audioElement.src = url;
      this.audioElement.load();
    }
    this.notifyMusicState();
  }

  // --- Built-in Benchmark Audio Track Generators ---
  public loadBenchmarkTrack(trackId: BenchmarkTrackId): void {
    this.initContext();
    if (!this.ctx) return;

    const sampleRate = this.ctx.sampleRate;
    let buffer: AudioBuffer;
    let trackName = '';

    if (trackId === 'vocal') {
      // 6-second rich acoustic progression with speech formants and bright sibilant cymbals
      trackName = 'Benchmark: Acoustic Vocal & Sibilance (6s Loop)';
      const length = sampleRate * 6;
      buffer = this.ctx.createBuffer(2, length, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      const chords = [
        [261.63, 329.63, 392.0], // C major
        [220.0, 261.63, 329.63], // A minor
        [174.61, 220.0, 261.63], // F major
        [196.0, 246.94, 293.66], // G major
      ];

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.floor((t / 6) * chords.length) % chords.length;
        const chord = chords[chordIdx];

        // Acoustic fundamental + rich 2nd/3rd harmonics
        let sample = 0;
        chord.forEach((freq, idx) => {
          const w = 2 * Math.PI * freq;
          sample += 0.12 * Math.sin(w * t) + 0.06 * Math.sin(2 * w * t) + 0.03 * Math.sin(3 * w * t);
          // Add vocal formant resonance (F1=800, F2=1800, F3=3200)
          sample += 0.025 * Math.sin(2 * Math.PI * (800 + idx * 200) * t);
        });

        // 8th-note metallic hi-hat cymbals (sibilance test at 6k - 14k)
        const beatTime = (t * 2) % 1;
        if (beatTime < 0.1) {
          const decay = Math.exp(-beatTime * 35);
          const noise = (Math.random() * 2 - 1) * decay * 0.18;
          sample += noise;
        }

        chL[i] = sample;
        chR[i] = sample;
      }
    } else if (trackId === 'bass') {
      // 4-second electronic beat with punchy kick, sub-bass 808, and snare
      trackName = 'Benchmark: Sub-Bass & Punchy Kick (4s Loop)';
      const length = sampleRate * 4;
      buffer = this.ctx.createBuffer(2, length, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let sample = 0;

        // Sub 808 Bass tone glide between 45Hz and 55Hz
        const bassFreq = 48 + 7 * Math.sin(2 * Math.PI * 0.5 * t);
        sample += 0.28 * Math.sin(2 * Math.PI * bassFreq * t);

        // Kick Drum hits on beat 0 and beat 2
        const beatPos = (t % 2);
        if (beatPos < 0.25) {
          const kickPitch = 120 * Math.exp(-beatPos * 25) + 50;
          const kickAmp = Math.exp(-beatPos * 12);
          sample += 0.35 * Math.sin(2 * Math.PI * kickPitch * beatPos) * kickAmp;
        }

        // Snare on beat 1 and beat 3 (200Hz punch + white noise snap)
        const snarePos = ((t + 1) % 2);
        if (snarePos < 0.2) {
          const snareTone = 0.2 * Math.sin(2 * Math.PI * 180 * snarePos) * Math.exp(-snarePos * 20);
          const snareNoise = 0.15 * (Math.random() * 2 - 1) * Math.exp(-snarePos * 15);
          sample += snareTone + snareNoise;
        }

        chL[i] = sample;
        chR[i] = sample;
      }
    } else {
      // Calibrated 5-second Pink Noise loop (Acoustic Calibration standard)
      trackName = 'Benchmark: Calibrated Full-Band Pink Noise (5s Loop)';
      const length = sampleRate * 5;
      buffer = this.ctx.createBuffer(2, length, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const val = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
        chL[i] = val;
        chR[i] = val;
      }
    }

    const wavBlob = audioBufferToWavBlob(buffer);
    const blobUrl = URL.createObjectURL(wavBlob);

    this.musicFileName = trackName;
    this.isBenchmarkTrack = true;

    if (this.audioElement) {
      this.audioElement.src = blobUrl;
      this.audioElement.load();
    }
    this.notifyMusicState();
  }

  public async playMusic(): Promise<void> {
    this.initContext();
    if (!this.ctx || !this.audioElement) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Stop tone oscillator and auto scan if active
    if (this.isRunning) {
      this.stop();
    }

    this.rebuildFilterChain(this.currentFixes);

    try {
      await this.audioElement.play();
      this.isMusicPlaying = true;
      this.notifyMusicState();
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  public pauseMusic(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.isMusicPlaying = false;
    this.notifyMusicState();
  }

  public toggleMusic(): Promise<void> | void {
    if (this.isMusicPlaying) {
      this.pauseMusic();
    } else {
      return this.playMusic();
    }
  }

  public seekMusic(seconds: number): void {
    if (this.audioElement && !isNaN(seconds)) {
      const clamped = Math.max(0, Math.min(this.audioElement.duration || 0, seconds));
      this.audioElement.currentTime = clamped;
      this.notifyMusicState();
    }
  }

  public setMusicLoop(loop: boolean): void {
    this.isMusicLooping = loop;
    if (this.audioElement) {
      this.audioElement.loop = loop;
    }
    this.notifyMusicState();
  }

  public getMusicState(): MusicState {
    return {
      isLoaded: !!this.musicFileName,
      isPlaying: this.isMusicPlaying,
      fileName: this.musicFileName,
      currentTime: this.audioElement?.currentTime || 0,
      duration: this.audioElement?.duration || 0,
      isLooping: this.isMusicLooping,
      isBenchmark: this.isBenchmarkTrack,
    };
  }
}
