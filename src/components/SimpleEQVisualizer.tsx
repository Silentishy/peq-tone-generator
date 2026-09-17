import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
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
  calculateCombinedFilterResponse,
  QMarkState,
  formatFreq,
} from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface SimpleEQVisualizerProps {
  fixes: EQFix[];
  currentFreq: number;
  onSelectFrequency: (freq: number) => void;
  onUpdateFix?: (fix: EQFix) => void;
  isAudioRunning: boolean;
  effectivePreamp?: number;
  isBypassed?: boolean;
  qMarks?: QMarkState;
}

// 7 precision stages for vertical dB scale: ±3 dB to ±24 dB
const DB_ZOOM_LEVELS = [3, 6, 9, 12, 15, 18, 24];

export const SimpleEQVisualizer: React.FC<SimpleEQVisualizerProps> = ({
  fixes,
  currentFreq,
  onSelectFrequency,
  onUpdateFix,
  isAudioRunning,
  effectivePreamp = 0,
  isBypassed = false,
  qMarks,
}) => {
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = AudioEngine.getInstance();
  const freqPointsRef = useRef<Float32Array | null>(null);
  const numPoints = 512;

  // Vertical dB Zoom: Index 3 corresponds to ±12 dB default
  const [dbZoomIdx, setDbZoomIdx] = useState<number>(3);
  const currentDbRange = DB_ZOOM_LEVELS[dbZoomIdx];

  // Horizontal Frequency Focus & Zoom State
  const [horizontalZoom, setHorizontalZoom] = useState<number>(1); // 1x to 10x
  const [focusCenterFreq, setFocusCenterFreq] = useState<number>(1000);
  const [minFreq, setMinFreq] = useState<number>(MIN_FREQ);
  const [maxFreq, setMaxFreq] = useState<number>(MAX_FREQ);

  // Curve & Layer Visibility Toggles
  const [showEqCurve, setShowEqCurve] = useState<boolean>(true);
  const [showNetCurve, setShowNetCurve] = useState<boolean>(true);
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [showRTA, setShowRTA] = useState<boolean>(true);
  const [showNodes, setShowNodes] = useState<boolean>(true);
  const [showQMarks, setShowQMarks] = useState<boolean>(true);

  // Interaction State: Dragging fix nodes or panning background
  const [draggingFixId, setDraggingFixId] = useState<string | null>(null);
  const [hoveredFixId, setHoveredFixId] = useState<string | null>(null);

  // Panning State
  const panStateRef = useRef<{
    isPanning: boolean;
    startX: number;
    startMinFreq: number;
    startMaxFreq: number;
    hasMoved: boolean;
  } | null>(null);

  const isZoomedIn = horizontalZoom > 1 || dbZoomIdx !== 3;

  // Compute and apply minFreq and maxFreq based on center frequency and zoom factor
  const updateWindow = useCallback((centerF: number, zoom: number) => {
    if (zoom <= 1) {
      setMinFreq(MIN_FREQ);
      setMaxFreq(MAX_FREQ);
      return;
    }
    const totalSpan = Math.log10(MAX_FREQ) - Math.log10(MIN_FREQ);
    const span = totalSpan / zoom;
    const halfSpan = span / 2;
    const centerLog = Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, centerF)));

    let minLog = centerLog - halfSpan;
    let maxLog = centerLog + halfSpan;

    if (minLog < Math.log10(MIN_FREQ)) {
      minLog = Math.log10(MIN_FREQ);
      maxLog = minLog + span;
    }
    if (maxLog > Math.log10(MAX_FREQ)) {
      maxLog = Math.log10(MAX_FREQ);
      minLog = maxLog - span;
    }

    setMinFreq(Math.round(Math.pow(10, minLog)));
    setMaxFreq(Math.round(Math.pow(10, maxLog)));
  }, []);

  // Initialize frequency sample points on log scale
  useEffect(() => {
    const points = new Float32Array(numPoints);
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    for (let i = 0; i < numPoints; i++) {
      const ratio = i / (numPoints - 1);
      points[i] = Math.pow(10, logMin + ratio * (logMax - logMin));
    }
    freqPointsRef.current = points;
  }, [minFreq, maxFreq]);

  // Zoom In / Out Handlers with smooth stepping
  const handleZoomIn = () => {
    if (dbZoomIdx > 0) {
      setDbZoomIdx((prev) => prev - 1);
    }
    const nextZoom = Math.min(10, Math.round((horizontalZoom * 1.35) * 10) / 10);
    setHorizontalZoom(nextZoom);
    updateWindow(focusCenterFreq, nextZoom);
  };

  const handleZoomOut = () => {
    if (dbZoomIdx < DB_ZOOM_LEVELS.length - 1) {
      setDbZoomIdx((prev) => prev + 1);
    }
    const nextZoom = Math.max(1, Math.round((horizontalZoom / 1.35) * 10) / 10);
    setHorizontalZoom(nextZoom);
    updateWindow(focusCenterFreq, nextZoom);
  };

  const handleZoomReset = () => {
    setDbZoomIdx(3); // Reset to ±12 dB (index 3)
    setHorizontalZoom(1);
    setFocusCenterFreq(1000);
    setMinFreq(MIN_FREQ);
    setMaxFreq(MAX_FREQ);
  };

  // Frequency Focus Slider Handler (Logarithmic 20 Hz – 20,000 Hz)
  const sliderLogMin = Math.log10(MIN_FREQ);
  const sliderLogMax = Math.log10(MAX_FREQ);
  const focusSliderVal = ((Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, focusCenterFreq))) - sliderLogMin) / (sliderLogMax - sliderLogMin)) * 1000;

  const handleFocusSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const logVal = sliderLogMin + (val / 1000) * (sliderLogMax - sliderLogMin);
    const nextCenter = Math.round(Math.pow(10, logVal));
    setFocusCenterFreq(nextCenter);

    // If user was at 1x, automatically apply a 2.5x zoom so focusing is immediately useful
    const effectiveZoom = horizontalZoom === 1 ? 2.5 : horizontalZoom;
    if (horizontalZoom === 1) {
      setHorizontalZoom(2.5);
    }
    updateWindow(nextCenter, effectiveZoom);
  };

  // Dynamic Frequency Landmark Grid Lines for Zoomed Views
  const getDynamicGridTicks = useCallback((): { freq: number; label: string }[] => {
    const spanRatio = maxFreq / minFreq;

    if (spanRatio > 15) {
      // Wide full-spectrum view: standard 6 landmarks
      return [
        { freq: 60, label: lang === 'zh' ? '低频 (60)' : 'Bass (60)' },
        { freq: 250, label: lang === 'zh' ? '中低 (250)' : 'Low-Mid (250)' },
        { freq: 1000, label: lang === 'zh' ? '人声 (1k)' : 'Vocals (1k)' },
        { freq: 4000, label: lang === 'zh' ? '临场 (4k)' : 'Presence (4k)' },
        { freq: 8000, label: lang === 'zh' ? '高频 (8k)' : 'Treble (8k)' },
        { freq: 16000, label: lang === 'zh' ? '极高 (16k)' : 'Air (16k)' },
      ];
    }

    // Narrow zoomed view: generate ticks at prominent frequencies
    const candidateTicks = [
      30, 40, 50, 60, 80, 100, 125, 150, 200, 250, 300, 400, 500, 650, 800, 1000,
      1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500,
      8000, 8500, 9000, 9500, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 18000, 20000,
    ];

    const inside = candidateTicks.filter((f) => f >= minFreq * 1.03 && f <= maxFreq * 0.97);

    // Pick at most 8-10 ticks evenly spaced
    const step = Math.max(1, Math.floor(inside.length / 8));
    const selected: { freq: number; label: string }[] = [];
    for (let i = 0; i < inside.length; i += step) {
      const f = inside[i];
      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      selected.push({ freq: f, label });
    }

    return selected;
  }, [minFreq, maxFreq, lang]);

  // Main 60 FPS Animation & Canvas Render Loop
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

      // 1. Studio Dark Background Fill
      ctx.fillStyle = '#0f131a';
      ctx.fillRect(0, 0, width, height);

      // 1.5 Real-Time Spectrum Glow (RTA)
      if (showRTA && engine.analyser && engine.getIsAnyAudioPlaying()) {
        engine.analyser.getByteFrequencyData(fftData);
        const sampleRate = engine.ctx?.sampleRate || 48000;
        const nyquist = sampleRate / 2;
        const binCount = fftData.length;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let px = 0; px < width; px += 3) {
          const f = xToFreq(px, width, minFreq, maxFreq);
          const bin = Math.min(binCount - 1, Math.floor((f / nyquist) * binCount));
          const val = fftData[bin] / 255.0;
          const barH = val * (height * 0.65);
          ctx.lineTo(px, height - barH);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const rtaGrad = ctx.createLinearGradient(0, height * 0.35, 0, height);
        rtaGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        rtaGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
        rtaGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = rtaGrad;
        ctx.fill();
        ctx.restore();
      }

      // 2. Dynamic dB Horizontal Grid Lines & Y-Axis Scale (7 Precision Stages)
      const dbSteps =
        currentDbRange === 3
          ? [3, 2, 1, 0, -1, -2, -3]
          : currentDbRange === 6
          ? [6, 3, 0, -3, -6]
          : currentDbRange === 9
          ? [9, 6, 3, 0, -3, -6, -9]
          : currentDbRange === 12
          ? [12, 6, 0, -6, -12]
          : currentDbRange === 15
          ? [15, 10, 5, 0, -5, -10, -15]
          : currentDbRange === 18
          ? [18, 12, 6, 0, -6, -12, -18]
          : [24, 18, 12, 6, 0, -6, -12, -18, -24];

      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'right';

      dbSteps.forEach((dbVal) => {
        const y = gainToY(dbVal, height, -currentDbRange, currentDbRange);
        ctx.beginPath();
        if (dbVal === 0) {
          // 0 dB Baseline Reference Line
          if (showBaseline) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } else {
          ctx.strokeStyle = '#1a2232';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // dB value label on right margin
        ctx.fillStyle = dbVal === 0 ? '#38bdf8' : '#52607a';
        ctx.fillText(`${dbVal > 0 ? '+' : ''}${dbVal} dB`, width - 6, y < 14 ? y + 10 : y - 3);
      });

      // 3. Dynamic Vertical Frequency Landmark Grid Lines
      const gridTicks = getDynamicGridTicks();
      gridTicks.forEach(({ freq, label }) => {
        if (freq < minFreq || freq > maxFreq) return;
        const x = freqToX(freq, width, minFreq, maxFreq);
        ctx.strokeStyle = '#1c2436';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, height - 6);
      });

      // 4. Combined Frequency Response After EQ Curve
      if (freqPointsRef.current) {
        const sampleRate = engine.ctx?.sampleRate || 48000;
        const activeFilterBands = fixes.filter((f) => f.enabled && f.gain !== 0);
        const rawDbResponses = calculateCombinedFilterResponse(activeFilterBands, freqPointsRef.current, sampleRate);
        const zeroY = gainToY(0, height, -currentDbRange, currentDbRange);

        // A. Draw Net Preamp Output Curve (Emerald dashed line)
        if (showNetCurve && !isBypassed && effectivePreamp !== 0 && activeFilterBands.length > 0) {
          ctx.save();
          ctx.beginPath();
          for (let i = 0; i < freqPointsRef.current.length; i++) {
            const x = freqToX(freqPointsRef.current[i], width, minFreq, maxFreq);
            const netDb = rawDbResponses[i] + effectivePreamp;
            const y = gainToY(netDb, height, -currentDbRange, currentDbRange);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 3]);
          ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }

        // B. Primary Frequency Response After EQ Curve (Cyan illuminated glow)
        if (showEqCurve) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, zeroY);

          for (let i = 0; i < freqPointsRef.current.length; i++) {
            const x = freqToX(freqPointsRef.current[i], width, minFreq, maxFreq);
            const dbVal = isBypassed ? 0 : rawDbResponses[i];
            const y = gainToY(dbVal, height, -currentDbRange, currentDbRange);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, zeroY);
          ctx.closePath();

          // Shaded fill under curve
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
          grad.addColorStop(1, 'rgba(244, 63, 94, 0.25)');
          ctx.fillStyle = grad;
          ctx.fill();

          // Stroke line
          ctx.beginPath();
          for (let i = 0; i < freqPointsRef.current.length; i++) {
            const x = freqToX(freqPointsRef.current[i], width, minFreq, maxFreq);
            const dbVal = isBypassed ? 0 : rawDbResponses[i];
            const y = gainToY(dbVal, height, -currentDbRange, currentDbRange);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.strokeStyle = isBypassed ? '#64748b' : '#00f0ff';
          ctx.lineWidth = 2.5;
          if (!isBypassed) {
            ctx.shadowColor = 'rgba(0, 240, 255, 0.75)';
            ctx.shadowBlur = 9;
          }
          ctx.stroke();
          ctx.restore();
        }

        // C. When bypassed, draw ghosted EQ curve so user sees the difference
        if (showEqCurve && isBypassed && activeFilterBands.length > 0) {
          ctx.save();
          ctx.beginPath();
          for (let i = 0; i < freqPointsRef.current.length; i++) {
            const x = freqToX(freqPointsRef.current[i], width, minFreq, maxFreq);
            const y = gainToY(rawDbResponses[i], height, -currentDbRange, currentDbRange);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 5. User Fix Dots & Badges (Interactive Draggable Handles)
      if (showNodes) {
        fixes.forEach((fix) => {
          if (!fix.enabled || fix.gain === 0) return;
          if (fix.frequency < minFreq || fix.frequency > maxFreq) return;

          const x = freqToX(fix.frequency, width, minFreq, maxFreq);
          const y = gainToY(fix.gain, height, -currentDbRange, currentDbRange);
          const isCut = fix.gain < 0;
          const isShelf = fix.filterType === 'lowshelf';
          const isHovered = fix.id === hoveredFixId;
          const isDragging = fix.id === draggingFixId;

          ctx.save();

          // Outer halo when hovered or dragging
          if (isHovered || isDragging) {
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.fillStyle = isShelf
              ? 'rgba(251, 191, 36, 0.25)'
              : isCut
              ? 'rgba(244, 63, 94, 0.25)'
              : 'rgba(56, 189, 248, 0.25)';
            ctx.fill();
            ctx.strokeStyle = isShelf ? '#fbbf24' : isCut ? '#f43f5e' : '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Glowing circle
          ctx.beginPath();
          ctx.arc(x, y, isHovered || isDragging ? 9 : 7, 0, Math.PI * 2);
          ctx.fillStyle = isShelf ? '#fbbf24' : isCut ? '#f43f5e' : '#38bdf8';
          ctx.shadowColor = isShelf ? '#fbbf24' : isCut ? '#f43f5e' : '#38bdf8';
          ctx.shadowBlur = isDragging ? 12 : 8;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Pill Badge
          const tag = `${isShelf ? 'LS ' : ''}${fix.gain >= 0 ? '+' : ''}${fix.gain.toFixed(1)}dB`;
          ctx.font = 'bold 10px monospace';
          const tagW = ctx.measureText(tag).width + 8;
          const tagY = isCut ? y + 12 : y - 20;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(x - tagW / 2, tagY, tagW, 16, 4);
          ctx.fill();
          ctx.strokeStyle = isShelf ? '#fbbf24' : isCut ? '#f43f5e' : '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tag, x, tagY + 8);
          ctx.restore();
        });
      }

      // 5.5. 3-Point Q Finder Marks
      if (showQMarks && qMarks) {
        const hasStart = qMarks.start != null && qMarks.start >= minFreq && qMarks.start <= maxFreq;
        const hasTop = qMarks.top != null && qMarks.top >= minFreq && qMarks.top <= maxFreq;
        const hasEnd = qMarks.end != null && qMarks.end >= minFreq && qMarks.end <= maxFreq;

        // Bandwidth shading between start and end
        if (qMarks.start != null && qMarks.end != null) {
          const xS = freqToX(qMarks.start, width, minFreq, maxFreq);
          const xE = freqToX(qMarks.end, width, minFreq, maxFreq);
          const leftX = Math.min(xS, xE);
          const spanW = Math.abs(xE - xS);

          ctx.save();
          ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
          ctx.fillRect(leftX, 0, spanW, height);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(leftX, 0, spanW, height);
          ctx.restore();
        }

        // Mark 1: Start (Emerald)
        if (hasStart && qMarks.start != null) {
          const x = freqToX(qMarks.start, width, minFreq, maxFreq);
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.roundRect(x - 22, height - 20, 44, 15, 3);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`1 ${formatFreq(qMarks.start)}`, x, height - 12);
          ctx.restore();
        }

        // Mark 2: Top / Peak (Amber)
        if (hasTop && qMarks.top != null) {
          const x = freqToX(qMarks.top, width, minFreq, maxFreq);
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.roundRect(x - 22, height - 20, 44, 15, 3);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`2 ${formatFreq(qMarks.top)}`, x, height - 12);
          ctx.restore();
        }

        // Mark 3: End (Purple)
        if (hasEnd && qMarks.end != null) {
          const x = freqToX(qMarks.end, width, minFreq, maxFreq);
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.roundRect(x - 22, height - 20, 44, 15, 3);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`3 ${formatFreq(qMarks.end)}`, x, height - 12);
          ctx.restore();
        }
      }

      // 6. Active Tone Marker (Vertical laser)
      if (currentFreq >= minFreq && currentFreq <= maxFreq) {
        const curX = freqToX(currentFreq, width, minFreq, maxFreq);
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
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [
    fixes,
    currentFreq,
    isAudioRunning,
    hoveredFixId,
    draggingFixId,
    currentDbRange,
    minFreq,
    maxFreq,
    effectivePreamp,
    isBypassed,
    showEqCurve,
    showNetCurve,
    showBaseline,
    showRTA,
    showNodes,
    showQMarks,
    qMarks,
    getDynamicGridTicks,
  ]);

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
      if (!showNodes) return null;
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
        const fx = freqToX(fix.frequency, width, minFreq, maxFreq);
        const fy = gainToY(fix.gain, height, -currentDbRange, currentDbRange);
        const dist = Math.hypot(x - fx, y - fy);
        if (dist <= 16) {
          return fix.id;
        }
      }
      return null;
    },
    [fixes, currentDbRange, minFreq, maxFreq, showNodes]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const hitId = findFixAtPos(e.clientX, e.clientY);
    if (hitId) {
      setDraggingFixId(hitId);
      const fix = fixes.find((f) => f.id === hitId);
      if (fix) onSelectFrequency(fix.frequency);
    } else {
      panStateRef.current = {
        isPanning: isZoomedIn,
        startX: e.clientX,
        startMinFreq: minFreq,
        startMaxFreq: maxFreq,
        hasMoved: false,
      };
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

    // Node dragging
    if (draggingFixId && onUpdateFix) {
      const fix = fixes.find((f) => f.id === draggingFixId);
      if (fix) {
        const rawFreq = xToFreq(x, width, minFreq, maxFreq);
        const newFreq = Math.round(Math.max(MIN_FREQ, Math.min(MAX_FREQ, rawFreq)));
        const rawGain = yToGain(y, height, -currentDbRange, currentDbRange);
        const newGain = Math.round(Math.max(MIN_GAIN, Math.min(MAX_GAIN, rawGain)) * 2) / 2;

        const updated = { ...fix, frequency: newFreq, gain: newGain };
        onUpdateFix(updated);
        onSelectFrequency(newFreq);
      }
      return;
    }

    // Horizontal panning when zoomed in
    if (panStateRef.current?.isPanning) {
      const deltaPx = e.clientX - panStateRef.current.startX;
      if (Math.abs(deltaPx) > 3) {
        panStateRef.current.hasMoved = true;
        const logMin = Math.log10(panStateRef.current.startMinFreq);
        const logMax = Math.log10(panStateRef.current.startMaxFreq);
        const span = logMax - logMin;
        const deltaRatio = -deltaPx / width;

        let nextLogMin = logMin + deltaRatio * span;
        let nextLogMax = logMax + deltaRatio * span;

        if (nextLogMin < Math.log10(MIN_FREQ)) {
          nextLogMin = Math.log10(MIN_FREQ);
          nextLogMax = nextLogMin + span;
        }
        if (nextLogMax > Math.log10(MAX_FREQ)) {
          nextLogMax = Math.log10(MAX_FREQ);
          nextLogMin = nextLogMax - span;
        }

        const newMinF = Math.round(Math.pow(10, nextLogMin));
        const newMaxF = Math.round(Math.pow(10, nextLogMax));
        setMinFreq(newMinF);
        setMaxFreq(newMaxF);
        setFocusCenterFreq(Math.round(Math.pow(10, (nextLogMin + nextLogMax) / 2)));
      }
      return;
    }

    // Hover state
    const hit = findFixAtPos(e.clientX, e.clientY);
    setHoveredFixId(hit);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingFixId) {
      setDraggingFixId(null);
    }

    if (panStateRef.current) {
      if (!panStateRef.current.hasMoved && !draggingFixId) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const dpr = window.devicePixelRatio || 1;
          const width = canvas.width / dpr;
          const freq = Math.round(xToFreq(x, width, minFreq, maxFreq));
          onSelectFrequency(freq);
        }
      }
      panStateRef.current = null;
    }
  };

  // Scroll wheel on canvas adjusts smooth zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const hoverFreq = xToFreq(mouseX, width, minFreq, maxFreq);

    // Fine-grained zoom stages (1.08x per notch for smooth precision)
    const zoomFactor = 1.08;
    if (e.deltaY < 0) {
      // Zoom In
      const nextZoom = Math.min(10, Math.round((horizontalZoom * zoomFactor) * 100) / 100);
      setHorizontalZoom(nextZoom);
      setFocusCenterFreq(Math.round(hoverFreq));
      updateWindow(hoverFreq, nextZoom);
    } else {
      // Zoom Out
      const nextZoom = Math.max(1, Math.round((horizontalZoom / zoomFactor) * 100) / 100);
      setHorizontalZoom(nextZoom);
      setFocusCenterFreq(Math.round(hoverFreq));
      updateWindow(hoverFreq, nextZoom);
    }
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
      } else {
        panStateRef.current = {
          isPanning: isZoomedIn,
          startX: touch.clientX,
          startMinFreq: minFreq,
          startMaxFreq: maxFreq,
          hasMoved: false,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (draggingFixId && onUpdateFix) {
      const fix = fixes.find((f) => f.id === draggingFixId);
      if (fix) {
        const rawFreq = xToFreq(x, width, minFreq, maxFreq);
        const newFreq = Math.round(Math.max(MIN_FREQ, Math.min(MAX_FREQ, rawFreq)));
        const rawGain = yToGain(y, height, -currentDbRange, currentDbRange);
        const newGain = Math.round(Math.max(MIN_GAIN, Math.min(MAX_GAIN, rawGain)) * 2) / 2;

        const updated = { ...fix, frequency: newFreq, gain: newGain };
        onUpdateFix(updated);
        onSelectFrequency(newFreq);
      }
      return;
    }

    if (panStateRef.current?.isPanning) {
      const deltaPx = touch.clientX - panStateRef.current.startX;
      if (Math.abs(deltaPx) > 5) {
        panStateRef.current.hasMoved = true;
        const logMin = Math.log10(panStateRef.current.startMinFreq);
        const logMax = Math.log10(panStateRef.current.startMaxFreq);
        const span = logMax - logMin;
        const deltaRatio = -deltaPx / width;

        let nextLogMin = logMin + deltaRatio * span;
        let nextLogMax = logMax + deltaRatio * span;

        if (nextLogMin < Math.log10(MIN_FREQ)) {
          nextLogMin = Math.log10(MIN_FREQ);
          nextLogMax = nextLogMin + span;
        }
        if (nextLogMax > Math.log10(MAX_FREQ)) {
          nextLogMax = Math.log10(MAX_FREQ);
          nextLogMin = nextLogMax - span;
        }

        const newMinF = Math.round(Math.pow(10, nextLogMin));
        const newMaxF = Math.round(Math.pow(10, nextLogMax));
        setMinFreq(newMinF);
        setMaxFreq(newMaxF);
        setFocusCenterFreq(Math.round(Math.pow(10, (nextLogMin + nextLogMax) / 2)));
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggingFixId) setDraggingFixId(null);
    panStateRef.current = null;
  };

  // Calculate live response at cursor frequency
  const sampleRate = engine.ctx?.sampleRate || 48000;
  const activeBands = fixes.filter((f) => f.enabled && f.gain !== 0);
  const singlePoint = new Float32Array([currentFreq]);
  const liveDbAtCursor = isBypassed ? 0 : calculateCombinedFilterResponse(activeBands, singlePoint, sampleRate)[0] || 0;

  return (
    <div id="step-4-visualizer" className="bg-studio-panel border border-studio-border rounded-2xl p-3 sm:p-5 shadow-xl flex flex-col gap-3">
      {/* Header: Step title + Vertical dB Scale Steppers */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            4
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {t.step4SectionTitle}
          </h2>
        </div>

        {/* Vertical Scale Badge & Zoom Reset */}
        <div className="flex items-center space-x-1.5 bg-studio-surface px-2 py-1 rounded-xl border border-studio-border text-xs">
          <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">
            {t.dbScaleLabel}
          </span>
          <span className="font-mono text-xs font-bold text-cyan-300 px-1">
            ±{currentDbRange} dB
          </span>

          <button
            type="button"
            onClick={handleZoomReset}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title={t.zoomReset}
            aria-label={t.zoomReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frequency Focus Slider */}
      <div className="flex flex-col gap-1.5 bg-studio-surface/90 p-2.5 sm:p-3 rounded-xl border border-studio-border/70 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex-shrink-0">
              {t.freqFocusSliderLabel}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300 flex-shrink-0">
              {focusCenterFreq >= 1000 ? `${(focusCenterFreq / 1000).toFixed(2)}k` : focusCenterFreq} Hz
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Visible Window Readout */}
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              {t.freqFocusVisible} {minFreq >= 1000 ? `${(minFreq / 1000).toFixed(1)}k` : minFreq} – {maxFreq >= 1000 ? `${(maxFreq / 1000).toFixed(1)}k` : maxFreq} Hz
            </span>

            {/* Current Zoom Multiplier Badge */}
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-studio-panel border border-studio-border text-amber-300">
              {horizontalZoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* The Slider Row with Zoom +/- Steppers */}
        <div className="flex items-center space-x-2 pt-0.5">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-studio-panel hover:bg-slate-700 border border-studio-border text-slate-300 hover:text-white transition active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title={t.zoomOut}
            aria-label={t.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Smooth Logarithmic Focus Center Slider */}
          <div className="flex-1 flex flex-col gap-0.5">
            <input
              type="range"
              min="0"
              max="1000"
              step="1"
              value={focusSliderVal}
              onChange={handleFocusSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
              aria-label={t.freqFocusSliderLabel}
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
              <span>20 Hz</span>
              <span>100 Hz</span>
              <span>1 kHz</span>
              <span>6 kHz</span>
              <span>20 kHz</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-studio-panel hover:bg-slate-700 border border-studio-border text-slate-300 hover:text-white transition active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title={t.zoomIn}
            aria-label={t.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Curve Visibility Toggle Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono bg-studio-surface/80 px-2.5 py-1.5 rounded-xl border border-studio-border/70">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1 mr-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            {lang === 'zh' ? '图层开关:' : 'Layers:'}
          </span>

          {/* Toggle EQ Curve */}
          <button
            type="button"
            onClick={() => setShowEqCurve((prev) => !prev)}
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition select-none ${
              showEqCurve
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold'
                : 'bg-studio-panel border-studio-border text-slate-500 line-through'
            }`}
            title="Toggle EQ Curve visibility"
          >
            {showEqCurve ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{t.toggleCurveEq}</span>
          </button>

          {/* Toggle Net Output (Preamp) */}
          {!isBypassed && effectivePreamp !== 0 && activeBands.length > 0 && (
            <button
              type="button"
              onClick={() => setShowNetCurve((prev) => !prev)}
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition select-none ${
                showNetCurve
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-studio-panel border-studio-border text-slate-500 line-through'
              }`}
              title="Toggle Net Output Curve visibility"
            >
              {showNetCurve ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{t.toggleCurveNet} ({effectivePreamp >= 0 ? '+' : ''}{effectivePreamp.toFixed(1)}dB)</span>
            </button>
          )}

          {/* Toggle 0 dB Baseline */}
          <button
            type="button"
            onClick={() => setShowBaseline((prev) => !prev)}
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition select-none ${
              showBaseline
                ? 'bg-studio-surface border-slate-600 text-slate-300 font-medium'
                : 'bg-studio-panel border-studio-border text-slate-500 line-through'
            }`}
            title="Toggle 0 dB baseline visibility"
          >
            {showBaseline ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{t.toggleCurveBaseline}</span>
          </button>

          {/* Toggle RTA Spectrum Glow */}
          <button
            type="button"
            onClick={() => setShowRTA((prev) => !prev)}
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition select-none ${
              showRTA
                ? 'bg-indigo-500/15 border-indigo-400/60 text-indigo-300 font-medium'
                : 'bg-studio-panel border-studio-border text-slate-500 line-through'
            }`}
            title="Toggle Real-time RTA spectrum glow"
          >
            {showRTA ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{t.toggleCurveRta}</span>
          </button>

          {/* Toggle Fix Nodes & Badges */}
          <button
            type="button"
            onClick={() => setShowNodes((prev) => !prev)}
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition select-none ${
              showNodes
                ? 'bg-studio-surface border-slate-500 text-slate-200 font-medium'
                : 'bg-studio-panel border-studio-border text-slate-500 line-through'
            }`}
            title="Toggle filter nodes on curve"
          >
            {showNodes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{t.toggleCurveNodes}</span>
          </button>

          {/* Toggle 3-Point Marks on Curve */}
          {qMarks && (qMarks.start != null || qMarks.top != null || qMarks.end != null) && (
            <button
              type="button"
              onClick={() => setShowQMarks((prev) => !prev)}
              className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition select-none ${
                showQMarks
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-studio-panel border-studio-border text-slate-500 line-through'
              }`}
              title="Toggle 3-Point Marks (1-2-3) on curve"
            >
              {showQMarks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{lang === 'zh' ? '三点标记 (1-2-3)' : '3-Point Marks'}</span>
            </button>
          )}
        </div>

        {/* Live dB Readout at cursor frequency */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400">@ {currentFreq >= 1000 ? `${(currentFreq / 1000).toFixed(2)}k` : currentFreq}Hz:</span>
          <span className={`font-bold font-mono ${liveDbAtCursor >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {liveDbAtCursor >= 0 ? '+' : ''}{liveDbAtCursor.toFixed(1)} dB
          </span>
        </div>
      </div>

      {/* Interactive Retina Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-xl overflow-hidden border border-studio-border bg-studio-surface shadow-inner select-none"
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
          onTouchEnd={handleTouchEnd}
          className={`w-full h-full block ${
            draggingFixId
              ? 'cursor-grabbing'
              : hoveredFixId
              ? 'cursor-grab'
              : isZoomedIn
              ? 'cursor-ew-resize'
              : 'cursor-crosshair'
          }`}
        />
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-900/85 px-2 py-0.5 rounded border border-slate-700/60">
          {t.dragHint}
        </div>
      </div>
    </div>
  );
};
