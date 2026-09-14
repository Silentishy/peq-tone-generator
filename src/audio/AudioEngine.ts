import { EQFix } from '../types/audio';
import { MIN_FREQ, MAX_FREQ } from '../utils/eqMath';

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  public analyser: AnalyserNode | null = null;

  // Dedicated stereo intermediate bus ensuring both ears get sound
  private stereoBus: GainNode | null = null;
  private sourceGain: GainNode | null = null;

  // Single pure tone oscillator
  private oscNode: OscillatorNode | null = null;

  // Filter chain
  private filterNodes: Map<string, BiquadFilterNode> = new Map();
  private filterInputNode: GainNode | null = null;
  private filterOutputNode: GainNode | null = null;

  // State
  private isRunning: boolean = false;
  private isBypassed: boolean = false; // A/B compare
  private volume: number = 0.25; // Safe default volume
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
    this.sourceGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.filterInputNode = this.ctx.createGain();
    this.filterInputNode.channelCount = 2;
    this.filterInputNode.channelCountMode = 'explicit';
    this.filterInputNode.channelInterpretation = 'speakers';

    this.filterOutputNode = this.ctx.createGain();
    this.filterOutputNode.channelCount = 2;
    this.filterOutputNode.channelCountMode = 'explicit';
    this.filterOutputNode.channelInterpretation = 'speakers';

    // Graph: Source -> FilterInput -> [Filters] -> FilterOutput -> StereoBus -> Analyser -> MasterGain -> Limiter -> Speakers
    this.sourceGain.connect(this.filterInputNode);
    this.filterOutputNode.connect(this.stereoBus);
    this.stereoBus.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
  }

  // --- Start / Stop Audio ---
  public async start(): Promise<void> {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.startOscillator();
    this.rebuildFilterChain(this.currentFixes);

    // Anti-pop smooth fade in
    if (this.sourceGain) {
      const now = this.ctx.currentTime;
      this.sourceGain.gain.cancelScheduledValues(now);
      this.sourceGain.gain.setValueAtTime(0, now);
      this.sourceGain.gain.linearRampToValueAtTime(1.0, now + 0.04);
    }

    this.isRunning = true;
  }

  public stop(): void {
    if (!this.ctx || !this.isRunning) return;

    this.stopAutoScan();

    // Anti-pop smooth fade out
    if (this.sourceGain) {
      const now = this.ctx.currentTime;
      this.sourceGain.gain.cancelScheduledValues(now);
      this.sourceGain.gain.setValueAtTime(this.sourceGain.gain.value, now);
      this.sourceGain.gain.linearRampToValueAtTime(0, now + 0.03);
    }

    setTimeout(() => {
      this.stopOscillator();
      this.isRunning = false;
    }, 35);
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

  private startOscillator() {
    if (!this.ctx || !this.sourceGain) return;
    this.stopOscillator();

    const now = this.ctx.currentTime;
    this.oscNode = this.ctx.createOscillator();
    this.oscNode.type = 'sine'; // Pure clean tone for ear testing
    this.oscNode.frequency.setValueAtTime(this.frequency, now);
    this.oscNode.connect(this.sourceGain);
    this.oscNode.start(now);
  }

  private stopOscillator() {
    if (this.oscNode) {
      try {
        this.oscNode.stop();
        this.oscNode.disconnect();
      } catch {}
      this.oscNode = null;
    }
  }

  // --- Frequency Control ---
  public setFrequency(freq: number, smooth = true) {
    const clampedFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
    this.frequency = clampedFreq;

    if (this.oscNode && this.ctx) {
      const now = this.ctx.currentTime;
      if (smooth) {
        this.oscNode.frequency.setTargetAtTime(clampedFreq, now, 0.015);
      } else {
        this.oscNode.frequency.setValueAtTime(clampedFreq, now);
      }
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
      node.type = 'peaking';
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
    node.frequency.setTargetAtTime(fix.frequency, now, 0.015);
    node.gain.setTargetAtTime(fix.gain, now, 0.015);
    node.Q.setTargetAtTime(fix.q, now, 0.015);
  }

  // --- Frequency Response for Canvas Graph ---
  public getCombinedFrequencyResponse(
    fixes: EQFix[],
    freqPoints: Float32Array
  ): Float32Array {
    const magResponse = new Float32Array(freqPoints.length).fill(1.0);
    const activeFixes = this.isBypassed
      ? []
      : fixes.filter((f) => f.enabled && f.gain !== 0);

    if (activeFixes.length === 0 || !this.ctx) {
      return new Float32Array(freqPoints.length).fill(0.0);
    }

    const tempFilter = this.ctx.createBiquadFilter();
    const tempMag = new Float32Array(freqPoints.length);
    const tempPhase = new Float32Array(freqPoints.length);

    for (const fix of activeFixes) {
      tempFilter.type = 'peaking';
      tempFilter.frequency.setValueAtTime(fix.frequency, this.ctx.currentTime);
      tempFilter.gain.setValueAtTime(fix.gain, this.ctx.currentTime);
      tempFilter.Q.setValueAtTime(fix.q, this.ctx.currentTime);

      tempFilter.getFrequencyResponse(
        freqPoints as unknown as Float32Array<ArrayBuffer>,
        tempMag as unknown as Float32Array<ArrayBuffer>,
        tempPhase as unknown as Float32Array<ArrayBuffer>
      );
      for (let i = 0; i < freqPoints.length; i++) {
        magResponse[i] *= tempMag[i];
      }
    }

    const dbResponse = new Float32Array(freqPoints.length);
    for (let i = 0; i < freqPoints.length; i++) {
      const mag = Math.max(1e-6, magResponse[i]);
      dbResponse[i] = 20 * Math.log10(mag);
    }

    return dbResponse;
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
}
