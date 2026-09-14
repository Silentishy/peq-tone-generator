import React, { useRef, useEffect } from 'react';
import { EQFix } from '../types/audio';
import { AudioEngine } from '../audio/AudioEngine';
import { freqToX, xToFreq, gainToY, MIN_FREQ, MAX_FREQ, MIN_GAIN, MAX_GAIN } from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface SimpleEQVisualizerProps {
  fixes: EQFix[];
  currentFreq: number;
  onSelectFrequency: (freq: number) => void;
  isAudioRunning: boolean;
}

const FREQ_LANDMARKS = [
  { freq: 60, label: 'Bass (60)' },
  { freq: 250, label: 'Low-Mid (250)' },
  { freq: 1000, label: 'Vocals (1k)' },
  { freq: 4000, label: 'Presence (4k)' },
  { freq: 8000, label: 'Treble (8k)' },
  { freq: 16000, label: 'Air (16k)' },
];

export const SimpleEQVisualizer: React.FC<SimpleEQVisualizerProps> = ({
  fixes,
  currentFreq,
  onSelectFrequency,
  isAudioRunning,
}) => {
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = AudioEngine.getInstance();
  const freqPointsRef = useRef<Float32Array | null>(null);
  const numPoints = 256;

  const freqLandmarks = [
    { freq: 60, label: lang === 'zh' ? '低频 (60)' : 'Bass (60)' },
    { freq: 250, label: lang === 'zh' ? '中低 (250)' : 'Low-Mid (250)' },
    { freq: 1000, label: lang === 'zh' ? '人声 (1k)' : 'Vocals (1k)' },
    { freq: 4000, label: lang === 'zh' ? '临场 (4k)' : 'Presence (4k)' },
    { freq: 8000, label: lang === 'zh' ? '高频 (8k)' : 'Treble (8k)' },
    { freq: 16000, label: lang === 'zh' ? '极高 (16k)' : 'Air (16k)' },
  ];

  // Initialize frequency sample points
  useEffect(() => {
    const points = new Float32Array(numPoints);
    const logMin = Math.log10(MIN_FREQ);
    const logMax = Math.log10(MAX_FREQ);
    for (let i = 0; i < numPoints; i++) {
      const ratio = i / (numPoints - 1);
      points[i] = Math.pow(10, logMin + ratio * (logMax - logMin));
    }
    freqPointsRef.current = points;
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const fftData = new Uint8Array(512);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      // 1. Background Fill
      ctx.fillStyle = '#10141d';
      ctx.fillRect(0, 0, width, height);

      // 1.5 Real-Time Spectrum Glow (RTA) for music or tone playback
      if (engine.analyser && engine.getIsAnyAudioPlaying()) {
        engine.analyser.getByteFrequencyData(fftData);
        const sampleRate = engine.ctx?.sampleRate || 48000;
        const nyquist = sampleRate / 2;
        const binCount = fftData.length;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let px = 0; px < width; px += 3) {
          const f = xToFreq(px, width);
          const bin = Math.min(binCount - 1, Math.floor((f / nyquist) * binCount));
          const val = fftData[bin] / 255.0; // 0 to 1
          const barH = val * (height * 0.65);
          ctx.lineTo(px, height - barH);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const rtaGrad = ctx.createLinearGradient(0, height * 0.35, 0, height);
        rtaGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        rtaGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
        rtaGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = rtaGrad;
        ctx.fill();
        ctx.restore();
      }

      // 2. 0 dB Baseline (Flat Reference)
      const zeroY = gainToY(0, height, -12, 12);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(t.flatReference, width - 8, zeroY - 5);

      // 3. Frequency landmark vertical grid lines
      freqLandmarks.forEach(({ freq, label }) => {
        const x = freqToX(freq, width);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, height - 6);
      });

      // 4. Combined EQ Curve
      if (freqPointsRef.current) {
        const dbResponses = engine.getCombinedFrequencyResponse(fixes, freqPointsRef.current);

        // Fill area
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        for (let i = 0; i < freqPointsRef.current.length; i++) {
          const x = freqToX(freqPointsRef.current[i], width);
          const y = gainToY(dbResponses[i], height, -12, 12);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, zeroY);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0.2)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        for (let i = 0; i < freqPointsRef.current.length; i++) {
          const x = freqToX(freqPointsRef.current[i], width);
          const y = gainToY(dbResponses[i], height, -12, 12);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // 5. User Fix Dots & Badges
      fixes.forEach((fix) => {
        if (!fix.enabled || fix.gain === 0) return;
        const x = freqToX(fix.frequency, width);
        const y = gainToY(fix.gain, height, -12, 12);
        const isCut = fix.gain < 0;

        // Glowing circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = isCut ? '#f43f5e' : '#38bdf8';
        ctx.shadowColor = isCut ? '#f43f5e' : '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pill Badge
        const tag = `${fix.gain >= 0 ? '+' : ''}${fix.gain.toFixed(1)}dB`;
        ctx.font = 'bold 10px monospace';
        const tagW = ctx.measureText(tag).width + 8;
        const tagY = isCut ? y + 12 : y - 20;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(x - tagW / 2, tagY, tagW, 16, 4);
        ctx.fill();
        ctx.strokeStyle = isCut ? '#f43f5e' : '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, x, tagY + 8);
        ctx.restore();
      });

      // 6. Active Tone Marker (Vertical laser)
      const curX = freqToX(currentFreq, width);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, height);
      ctx.strokeStyle = isAudioRunning ? '#fbbf24' : '#64748b';
      ctx.lineWidth = 1.8;
      if (isAudioRunning) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
      }
      ctx.stroke();

      // Top frequency badge
      ctx.fillStyle = isAudioRunning ? '#fbbf24' : '#475569';
      ctx.beginPath();
      ctx.roundRect(curX - 28, 4, 56, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        currentFreq >= 1000 ? `${(currentFreq / 1000).toFixed(1)}k` : `${Math.round(currentFreq)}Hz`,
        curX,
        12
      );
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [fixes, currentFreq, isAudioRunning]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const freq = Math.round(xToFreq(x, width));
    onSelectFrequency(freq);
  };

  return (
    <div className="bg-studio-panel border border-studio-border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            3
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {t.step3Title}
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {t.step3Subtitle}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-52 sm:h-64 lg:h-72 rounded-xl overflow-hidden border border-studio-border bg-studio-surface shadow-inner cursor-crosshair select-none"
      >
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full block" />
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-900/85 px-2 py-0.5 rounded border border-slate-700/60">
          {t.visualPreview}
        </div>
      </div>
    </div>
  );
};
