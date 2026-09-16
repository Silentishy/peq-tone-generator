import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  Volume2,
  Waves,
  Sparkles,
  Info,
  Target,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  getFrequencyZone,
  FREQUENCY_LANDMARKS,
  formatFreq,
  MIN_FREQ,
  MAX_FREQ,
  QMarkState,
  calculateQFromMarks,
} from '../utils/eqMath';
import { ToneMode } from '../types/audio';
import { useLanguage } from '../context/LanguageContext';

interface FrequencyScannerProps {
  frequency: number;
  onChangeFrequency: (freq: number) => void;
  isAutoScanning: boolean;
  onToggleAutoScan: (speed?: 'slow' | 'normal' | 'fast') => void;
  isAudioRunning: boolean;
  onStartAudio: () => void;
  toneMode: ToneMode;
  onSelectToneMode: (mode: ToneMode) => void;
  isEqualLoudness: boolean;
  onToggleEqualLoudness: () => void;
  qMarks: QMarkState;
  onSetMark: (which: 'start' | 'top' | 'end', freq?: number) => void;
  onClearMarks: () => void;
}

type CategorySection = 'bass' | 'mids' | 'treble' | 'air';

export const FrequencyScanner: React.FC<FrequencyScannerProps> = ({
  frequency,
  onChangeFrequency,
  isAutoScanning,
  onToggleAutoScan,
  isAudioRunning,
  onStartAudio,
  toneMode,
  onSelectToneMode,
  isEqualLoudness,
  onToggleEqualLoudness,
  qMarks,
  onSetMark,
  onClearMarks,
}) => {
  const { t, lang } = useLanguage();
  const currentZone = getFrequencyZone(frequency);
  const landmarksContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<CategorySection>('mids');
  const [isQFinderOpen, setIsQFinderOpen] = useState<boolean>(true);

  // Convert logarithmic frequency to 0-1000 slider scale
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  const sliderValue = ((Math.log10(frequency) - logMin) / (logMax - logMin)) * 1000;

  const getPercent = (f: number) => {
    const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, f));
    return ((Math.log10(clamped) - logMin) / (logMax - logMin)) * 100;
  };

  const calculatedResult = calculateQFromMarks(qMarks);
  const hasAnyMark = qMarks.start != null || qMarks.top != null || qMarks.end != null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const logVal = logMin + (val / 1000) * (logMax - logMin);
    const nextFreq = Math.round(Math.pow(10, logVal) * 10) / 10;
    onChangeFrequency(nextFreq);
  };

  const nudge = (delta: number) => {
    const next = Math.max(MIN_FREQ, Math.min(MAX_FREQ, Math.round((frequency + delta) * 10) / 10));
    onChangeFrequency(next);
  };

  const scrollToCategory = (cat: CategorySection) => {
    setActiveCategory(cat);
    const container = landmarksContainerRef.current;
    if (!container) return;
    const targetCard = container.querySelector(`[data-category="${cat}"]`) as HTMLElement | null;
    if (targetCard) {
      const top = targetCard.offsetTop - container.offsetTop;
      container.scrollTo({ top: Math.max(0, top - 2), behavior: 'smooth' });
    }
  };

  const handleLandmarksScroll = () => {
    const container = landmarksContainerRef.current;
    if (!container) return;
    const scrollTop = container.scrollTop;
    const containerTop = container.offsetTop;

    const sections: CategorySection[] = ['bass', 'mids', 'treble', 'air'];
    let visibleCat: CategorySection = 'bass';

    for (const cat of sections) {
      const el = container.querySelector(`[data-category="${cat}"]`) as HTMLElement | null;
      if (el) {
        const top = el.offsetTop - containerTop;
        if (scrollTop >= top - 20) {
          visibleCat = cat;
        }
      }
    }
    setActiveCategory(visibleCat);
  };

  const categories: { key: CategorySection; label: string; count: number }[] = [
    {
      key: 'bass',
      label: t.catBass,
      count: FREQUENCY_LANDMARKS.filter((lm) => lm.category === 'bass').length,
    },
    {
      key: 'mids',
      label: t.catMids,
      count: FREQUENCY_LANDMARKS.filter((lm) => lm.category === 'mids').length,
    },
    {
      key: 'treble',
      label: t.catTreble,
      count: FREQUENCY_LANDMARKS.filter((lm) => lm.category === 'treble').length,
    },
    {
      key: 'air',
      label: t.catAir,
      count: FREQUENCY_LANDMARKS.filter((lm) => lm.category === 'air').length,
    },
  ];

  const zoneName = lang === 'zh' && currentZone.nameZh ? currentZone.nameZh : currentZone.name;
  const zoneDesc = lang === 'zh' && currentZone.descriptionZh ? currentZone.descriptionZh : currentZone.description;
  const zoneProb = lang === 'zh' && currentZone.commonProblemsZh ? currentZone.commonProblemsZh : currentZone.commonProblems;

  const isPinnaRegion = frequency >= 2500 && frequency <= 4500;

  return (
    <div id="step-1-scanner" className="bg-studio-panel border border-studio-border rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col gap-3.5 sm:gap-4">
      {/* Step Indicator & Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            1
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            {t.step1Title}
          </h2>
        </div>

        {/* Generator Controls: Sine vs Narrowband Noise & Equal-Loudness Toggle */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Tone Mode: Sine vs Noise */}
          <div className="flex bg-studio-surface rounded-xl border border-studio-border p-0.5 text-xs font-medium">
            <button
              onClick={() => onSelectToneMode('sine')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] sm:text-xs ${
                toneMode === 'sine'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.toneModeSineDesc}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>{toneMode === 'sine' ? t.toneModeSine : 'Sine'}</span>
            </button>
            <button
              onClick={() => onSelectToneMode('narrow_noise')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] sm:text-xs ${
                toneMode === 'narrow_noise'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t.toneModeNoiseDesc}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{toneMode === 'narrow_noise' ? t.toneModeNoise : 'Noise'}</span>
            </button>
          </div>

          {/* Equal-Loudness (ISO 226) Normalization Toggle */}
          <button
            onClick={onToggleEqualLoudness}
            className={`px-2 sm:px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 ${
              isEqualLoudness
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-sm'
                : 'bg-studio-surface border-studio-border text-slate-400 hover:text-slate-200'
            }`}
            title={t.equalLoudnessTooltip}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEqualLoudness ? t.equalLoudnessOn : t.equalLoudnessOff}</span>
          </button>
        </div>
      </div>

      {/* Massive Frequency Readout & Zone Card */}
      <div className="bg-studio-surface border border-studio-border/80 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        {/* Hertz Number */}
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-cyan-300 tracking-tight">
            {frequency >= 1000 ? (frequency / 1000).toFixed(2) : frequency.toFixed(0)}
          </span>
          <span className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-cyan-500">
            {frequency >= 1000 ? 'kHz' : 'Hz'}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1">
            ({Math.round(frequency)} Hz)
          </span>
        </div>

        {/* Current Zone Badge & Educational Helper */}
        <div className="flex-1 max-w-lg bg-studio-panel/70 p-2.5 sm:p-3 rounded-xl border border-studio-border/60">
          <div className="flex items-center space-x-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentZone.color }}
            />
            <span className="text-xs font-bold text-slate-200">
              {zoneName} ({currentZone.minFreq} -{' '}
              {currentZone.maxFreq >= 1000 ? `${currentZone.maxFreq / 1000}k` : currentZone.maxFreq} Hz)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            {zoneDesc} <span className="text-slate-400">{zoneProb}</span>
          </p>
        </div>
      </div>

      {/* Educational Pinna Gain Callout when in 2.5k - 4.5k region */}
      {isPinnaRegion && (
        <div className="flex items-center space-x-2 bg-indigo-950/30 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-indigo-300/90 leading-tight">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{t.pinnaGainNotice}</span>
        </div>
      )}

      {/* Smooth Logarithmic Frequency Slider with Optional Q-Mark Indicators */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] sm:text-xs font-mono text-slate-400 px-1">
          <span>20 Hz {lang === 'zh' ? '(极低频)' : '(Sub)'}</span>
          <span>100 Hz</span>
          <span>500 Hz</span>
          <span>2 kHz</span>
          <span>6 kHz {lang === 'zh' ? '(齿音频)' : '(Treble)'}</span>
          <span>20 kHz {lang === 'zh' ? '(极限)' : '(Air)'}</span>
        </div>

        <div className="relative flex items-center">
          {/* Visual Bandwidth Shading if start and end exist */}
          {qMarks.start != null && qMarks.end != null && (
            <div
              className="absolute h-3 bg-cyan-400/25 rounded pointer-events-none z-0"
              style={{
                left: `${Math.min(getPercent(qMarks.start), getPercent(qMarks.end))}%`,
                width: `${Math.max(1, Math.abs(getPercent(qMarks.end) - getPercent(qMarks.start)))}%`,
              }}
            />
          )}
          {/* Start Pin */}
          {qMarks.start != null && (
            <div
              className="absolute -top-3.5 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center"
              style={{ left: `${getPercent(qMarks.start)}%` }}
              title={`Start: ${formatFreq(qMarks.start)}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 ring-2 ring-slate-900" />
            </div>
          )}
          {/* Top Pin */}
          {qMarks.top != null && (
            <div
              className="absolute -top-3.5 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center"
              style={{ left: `${getPercent(qMarks.top)}%` }}
              title={`Peak: ${formatFreq(qMarks.top)}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80 ring-2 ring-slate-900" />
            </div>
          )}
          {/* End Pin */}
          {qMarks.end != null && (
            <div
              className="absolute -top-3.5 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center"
              style={{ left: `${getPercent(qMarks.end)}%` }}
              title={`End: ${formatFreq(qMarks.end)}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/80 ring-2 ring-slate-900" />
            </div>
          )}
          <input
            type="range"
            min="0"
            max="1000"
            step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-inner relative z-10 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            aria-label="Frequency sweep slider"
          />
        </div>
      </div>

      {/* 3-Point Mark-to-Q Measurement Panel (eqbyear method) */}
      <div className="bg-studio-surface/80 border border-studio-border/80 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2 transition-all">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsQFinderOpen((prev) => !prev)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 hover:text-white transition group focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none rounded"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>{t.qFinderTitle}</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              • {t.qFinderSubtitle}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isQFinderOpen ? 'rotate-180 text-cyan-300' : ''
              }`}
            />
          </button>

          {hasAnyMark && (
            <button
              type="button"
              onClick={onClearMarks}
              className="text-[11px] font-mono text-slate-400 hover:text-rose-400 transition flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-rose-400 focus:outline-none rounded px-1.5 py-0.5"
              title={t.qFinderReset}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.qFinderReset}</span>
            </button>
          )}
        </div>

        {isQFinderOpen && (
          <div className="flex flex-col gap-2 pt-1">
            {/* 3 Mark Buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {/* Mark 1: Start */}
              <button
                type="button"
                onClick={() => onSetMark('start', frequency)}
                className={`p-2 rounded-xl border text-left transition flex flex-col justify-between active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                  qMarks.start != null
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-sm'
                    : 'bg-studio-panel border-studio-border text-slate-300 hover:border-slate-600'
                }`}
                title={t.shortcut1Desc}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-300">1. {t.qFinderStart}</span>
                  <kbd className="px-1.5 py-0.2 rounded bg-studio-surface border border-slate-700 font-mono text-[10px] font-bold text-slate-400">
                    1
                  </kbd>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 mt-1 truncate">
                  {qMarks.start != null ? formatFreq(qMarks.start) : '--'}
                </span>
              </button>

              {/* Mark 2: Top / Peak */}
              <button
                type="button"
                onClick={() => onSetMark('top', frequency)}
                className={`p-2 rounded-xl border text-left transition flex flex-col justify-between active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                  qMarks.top != null
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-studio-panel border-studio-border text-slate-300 hover:border-slate-600'
                }`}
                title={t.shortcut2Desc}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-300">2. {t.qFinderTop}</span>
                  <kbd className="px-1.5 py-0.2 rounded bg-studio-surface border border-slate-700 font-mono text-[10px] font-bold text-slate-400">
                    2
                  </kbd>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 mt-1 truncate">
                  {qMarks.top != null ? formatFreq(qMarks.top) : '--'}
                </span>
              </button>

              {/* Mark 3: End */}
              <button
                type="button"
                onClick={() => onSetMark('end', frequency)}
                className={`p-2 rounded-xl border text-left transition flex flex-col justify-between active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                  qMarks.end != null
                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-200 shadow-sm'
                    : 'bg-studio-panel border-studio-border text-slate-300 hover:border-slate-600'
                }`}
                title={t.shortcut3Desc}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-300">3. {t.qFinderEnd}</span>
                  <kbd className="px-1.5 py-0.2 rounded bg-studio-surface border border-slate-700 font-mono text-[10px] font-bold text-slate-400">
                    3
                  </kbd>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400 mt-1 truncate">
                  {qMarks.end != null ? formatFreq(qMarks.end) : '--'}
                </span>
              </button>
            </div>

            {/* Calculated Result Banner (Automatic hand-off to Step 2) */}
            {calculatedResult && (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-studio-panel p-2.5 rounded-xl border border-cyan-500/40 shadow-sm mt-0.5 animate-fade-in">
                <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                  <span className="text-slate-200 font-bold">
                    Fc: <span className="text-amber-300">{formatFreq(calculatedResult.fc)}</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">
                    {t.qFinderSpan}: <span className="text-slate-200">{calculatedResult.span} Hz</span>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">
                    Q: {calculatedResult.q.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-cyan-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-semibold">{lang === 'zh' ? '已自动同步至步骤 2' : 'Synced to Step 2'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls: Auto-Scan & Nudge Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-studio-border/50">
        {/* Auto-Walk Player */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (!isAudioRunning) onStartAudio();
              onToggleAutoScan('normal');
            }}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow active:scale-95 ${
              isAutoScanning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-400/40 animate-pulse'
                : 'bg-studio-surface hover:bg-slate-700 text-slate-200 border border-studio-border'
            }`}
          >
            {isAutoScanning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t.autoScanPause}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                <span>{t.autoScanStart}</span>
              </>
            )}
          </button>

          {isAutoScanning && (
            <div className="flex bg-studio-surface rounded-lg border border-studio-border p-0.5 text-[11px] font-mono">
              <button
                onClick={() => onToggleAutoScan('slow')}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white"
              >
                {t.scanSpeedSlow}
              </button>
              <button
                onClick={() => onToggleAutoScan('normal')}
                className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold"
              >
                {t.scanSpeedNormal}
              </button>
              <button
                onClick={() => onToggleAutoScan('fast')}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white"
              >
                {t.scanSpeedFast}
              </button>
            </div>
          )}
        </div>

        {/* Nudge Stepper Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-mono">
          <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">{t.fineTune}</span>
          <button
            onClick={() => nudge(-100)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title="Step down 100 Hz"
            aria-label="Step down 100 Hz"
          >
            <ChevronsLeft className="w-3.5 h-3.5 inline mr-0.5" />
            100
          </button>
          <button
            onClick={() => nudge(-10)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title="Step down 10 Hz"
            aria-label="Step down 10 Hz"
          >
            <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />
            10
          </button>
          <button
            onClick={() => nudge(10)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title="Step up 10 Hz"
            aria-label="Step up 10 Hz"
          >
            +10
            <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
          <button
            onClick={() => nudge(100)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            title="Step up 100 Hz"
            aria-label="Step up 100 Hz"
          >
            +100
            <ChevronsRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
        </div>
      </div>

      {/* Quick Jump Frequency Landmarks: Exactly 3 Rows & Smooth Section Scrolling */}
      <div className="flex flex-col gap-2 pt-2 border-t border-studio-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              {t.jumpTitle}
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden xs:inline">
              {t.jumpSubtitle}
            </span>
          </div>

          {/* Category Section Scroll Buttons (Bass, Mids, Treble, Air - No All button) */}
          <div className="flex items-center bg-studio-surface rounded-lg border border-studio-border p-0.5 text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => scrollToCategory(cat.key)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] transition active:scale-95 ${
                  activeCategory === cat.key
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* 3-Row Scrollable Card Grid */}
        <div
          ref={landmarksContainerRef}
          onScroll={handleLandmarksScroll}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-1.5 h-[148px] overflow-y-auto pr-1 scrollbar-thin scroll-smooth"
        >
          {FREQUENCY_LANDMARKS.map((lm) => {
            const isCurrent = Math.abs(frequency - lm.exactFreq) / lm.exactFreq < 0.025;
            const freqStr = formatFreq(lm.exactFreq);
            const lmName = lang === 'zh' && lm.nameZh ? lm.nameZh : lm.name;
            const lmDesc = lang === 'zh' && lm.descZh ? lm.descZh : lm.desc;

            return (
              <button
                key={lm.exactFreq}
                data-category={lm.category}
                onClick={() => onChangeFrequency(lm.exactFreq)}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all flex flex-col justify-between active:scale-95 ${
                  isCurrent
                    ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/60'
                    : 'bg-studio-surface border-studio-border hover:border-slate-600 text-slate-300'
                }`}
                title={`${lmName} (${lm.exactFreq} Hz): ${lmDesc}`}
              >
                {/* Top: Color indicator + Exact Frequency Tag */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: lm.color }}
                  />
                  <span
                    className={`font-mono text-xs font-bold ${
                      isCurrent ? 'text-white font-black' : 'text-cyan-300'
                    }`}
                  >
                    {freqStr}
                  </span>
                </div>

                {/* Bottom: Short Landmark Name */}
                <span className="text-[10px] text-slate-400 truncate w-full mt-0.5 leading-tight">
                  {lmName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
