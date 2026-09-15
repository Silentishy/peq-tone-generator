import React, { useRef, useEffect, useState, useCallback } from 'react';
import { EQFix, FilterWidth } from '../types/audio';
import { AudioEngine } from '../audio/AudioEngine';
import {
  freqToX,
  xToFreq,
  gainToY,
  yToGain,
  MIN_FREQ,
  MAX_FREQ,
  MIN_GAIN,
  MAX_GAIN,
  WIDTH_MAP,
} from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface SimpleEQVisualizerProps {
  fixes: EQFix[];
  currentFreq: number;
  onSelectFrequency: (freq: number) => void;
  onUpdateFix?: (fix: EQFix) => void;
  isAudioRunning: boolean;
}

export const SimpleEQVisualizer: React.FC<SimpleEQVisualizerProps> = ({
  fixes,
  currentFreq,
  onSelectFrequency,
  onUpdateFix,
  isAudioRunning,
}) => {
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = AudioEngine.getInstance();
  const freqPointsRef = useRef<Float32Array | null>(null);
  const numPoints = 256;

  const [draggingFixId, setDraggingFixId] = useState<string | null>(null);
  const [hoveredFixId, setHoveredFixId] = useState<string | null>(null);

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

      // 5. User Fix Dots & Badges (Interactive Draggable Handles)
      fixes.forEach((fix) => {
        if (!fix.enabled || fix.gain === 0) return;
        const x = freqToX(fix.frequency, width);
        const y = gainToY(fix.gain, height, -12, 12);
        const isCut = fix.gain < 0;
        const isHovered = fix.id === hoveredFixId;
        const isDragging = fix.id === draggingFixId;

        ctx.save();

        // Outer halo when hovered or dragging
        if (isHovered || isDragging) {
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fillStyle = isCut ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.25)';
          ctx.fill();
          ctx.strokeStyle = isCut ? '#f43f5e' : '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Glowing circle
        ctx.beginPath();
        ctx.arc(x, y, isHovered || isDragging ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isCut ? '#f43f5e' : '#38bdf8';
        ctx.shadowColor = isCut ? '#f43f5e' : '#38bdf8';
        ctx.shadowBlur = isDragging ? 12 : 8;
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
  }, [fixes, currentFreq, isAudioRunning, hoveredFixId, draggingFixId]);

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

  // --- Node Hit-testing & Dragging ---
  const findFixAtPos = useCallback(
    (clientX: number, clientY: number): string | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      for (let i = fixes.length - 1; i >= 0; i--) {
        const fix = fixes[i];
        if (!fix.enabled || fix.gain === 0) continue;
        const fx = freqToX(fix.frequency, width);
        const fy = gainToY(fix.gain, height, -12, 12);
        const dist = Math.hypot(x - fx, y - fy);
        if (dist <= 16) {
          return fix.id;
        }
      }
      return null;
    },
    [fixes]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hitId = findFixAtPos(e.clientX, e.clientY);
    if (hitId) {
      setDraggingFixId(hitId);
      const fix = fixes.find((f) => f.id === hitId);
      if (fix) onSelectFrequency(fix.frequency);
    } else {
      // Jump frequency on empty canvas click
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const freq = Math.round(xToFreq(x, width));
      onSelectFrequency(freq);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (draggingFixId && onUpdateFix) {
      const fix = fixes.find((f) => f.id === draggingFixId);
      if (fix) {
        const rawFreq = xToFreq(x, width);
        const newFreq = Math.round(Math.max(MIN_FREQ, Math.min(MAX_FREQ, rawFreq)));
        const rawGain = yToGain(y, height, -12, 12);
        const newGain = Math.round(Math.max(MIN_GAIN, Math.min(MAX_GAIN, rawGain)) * 2) / 2; // snap to 0.5dB

        const updated = { ...fix, frequency: newFreq, gain: newGain };
        onUpdateFix(updated);
        onSelectFrequency(newFreq);
      }
    } else {
      const hit = findFixAtPos(e.clientX, e.clientY);
      setHoveredFixId(hit);
    }
  };

  const handleMouseUp = () => {
    if (draggingFixId) {
      setDraggingFixId(null);
    }
  };

  // Scroll wheel on a node cycles filter width (narrow <-> normal <-> wide)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const targetId = hoveredFixId || draggingFixId;
    if (!targetId || !onUpdateFix) return;
    e.preventDefault();

    const fix = fixes.find((f) => f.id === targetId);
    if (!fix) return;

    const widths: FilterWidth[] = ['narrow', 'normal', 'wide'];
    const currentIdx = widths.indexOf(fix.width);
    const nextIdx = e.deltaY < 0 ? (currentIdx - 1 + 3) % 3 : (currentIdx + 1) % 3;
    const nextWidth = widths[nextIdx];

    onUpdateFix({
      ...fix,
      width: nextWidth,
      q: WIDTH_MAP[nextWidth].q,
    });
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const hitId = findFixAtPos(touch.clientX, touch.clientY);
      if (hitId) {
        setDraggingFixId(hitId);
        const fix = fixes.find((f) => f.id === hitId);
        if (fix) onSelectFrequency(fix.frequency);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!draggingFixId || !onUpdateFix || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const fix = fixes.find((f) => f.id === draggingFixId);
    if (fix) {
      const rawFreq = xToFreq(x, width);
      const newFreq = Math.round(Math.max(MIN_FREQ, Math.min(MAX_FREQ, rawFreq)));
      const rawGain = yToGain(y, height, -12, 12);
      const newGain = Math.round(Math.max(MIN_GAIN, Math.min(MAX_GAIN, rawGain)) * 2) / 2;

      const updated = { ...fix, frequency: newFreq, gain: newGain };
      onUpdateFix(updated);
      onSelectFrequency(newFreq);
    }
  };

  return (
    <div id="step-4-visualizer" className="bg-studio-panel border border-studio-border rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            4
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {t.step4SectionTitle}
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/90 hidden sm:inline">
          {t.dragHint}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-44 sm:h-52 md:h-60 lg:h-64 xl:h-72 rounded-xl overflow-hidden border border-studio-border bg-studio-surface shadow-inner select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`w-full h-full block ${
            draggingFixId ? 'cursor-grabbing' : hoveredFixId ? 'cursor-grab' : 'cursor-crosshair'
          }`}
        />
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-900/85 px-2 py-0.5 rounded border border-slate-700/60">
          {t.visualPreview}
        </div>
      </div>
    </div>
  );
};
