import React, { useState } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Compass,
} from 'lucide-react';
import {
  getFrequencyZone,
  FREQUENCY_LANDMARKS,
  formatFreq,
  MIN_FREQ,
  MAX_FREQ,
} from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface FrequencyScannerProps {
  frequency: number;
  onChangeFrequency: (freq: number) => void;
  isAutoScanning: boolean;
  onToggleAutoScan: (speed?: 'slow' | 'normal' | 'fast') => void;
  isAudioRunning: boolean;
  onStartAudio: () => void;
}

type CategoryFilter = 'all' | 'bass' | 'mids' | 'treble' | 'air';

export const FrequencyScanner: React.FC<FrequencyScannerProps> = ({
  frequency,
  onChangeFrequency,
  isAutoScanning,
  onToggleAutoScan,
  isAudioRunning,
  onStartAudio,
}) => {
  const { t, lang } = useLanguage();
  const currentZone = getFrequencyZone(frequency);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Convert logarithmic frequency to 0-1000 slider scale
  const logMin = Math.log10(MIN_FREQ);
  const logMax = Math.log10(MAX_FREQ);
  const sliderValue = ((Math.log10(frequency) - logMin) / (logMax - logMin)) * 1000;

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

  const filteredLandmarks =
    selectedCategory === 'all'
      ? FREQUENCY_LANDMARKS
      : FREQUENCY_LANDMARKS.filter((lm) => lm.category === selectedCategory);

  const categories: { key: CategoryFilter; label: string; count: number }[] = [
    { key: 'all', label: t.catAll, count: FREQUENCY_LANDMARKS.length },
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

  return (
    <div className="bg-studio-panel border border-studio-border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Step Indicator & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            1
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            {t.step1Title}
          </h2>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
          {t.step1Subtitle}
        </span>
      </div>

      {/* Massive Frequency Readout & Zone Card */}
      <div className="bg-studio-surface border border-studio-border/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Hertz Number */}
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl sm:text-5xl font-mono font-black text-cyan-300 tracking-tight">
            {frequency >= 1000 ? (frequency / 1000).toFixed(2) : frequency.toFixed(0)}
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-cyan-500">
            {frequency >= 1000 ? 'kHz' : 'Hz'}
          </span>
          <span className="text-xs font-mono text-slate-500 ml-1">
            ({Math.round(frequency)} Hz)
          </span>
        </div>

        {/* Current Zone Badge & Educational Helper */}
        <div className="flex-1 max-w-lg bg-studio-panel/70 p-3 rounded-xl border border-studio-border/60">
          <div className="flex items-center space-x-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
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

      {/* Smooth Logarithmic Frequency Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-400 px-1">
          <span>20 Hz {lang === 'zh' ? '(极低频)' : '(Sub)'}</span>
          <span>100 Hz</span>
          <span>500 Hz</span>
          <span>2 kHz</span>
          <span>6 kHz {lang === 'zh' ? '(齿音频)' : '(Treble)'}</span>
          <span>20 kHz {lang === 'zh' ? '(极限)' : '(Air)'}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="1"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-inner"
        />
      </div>

      {/* Navigation Controls: Auto-Scan & Nudge Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-studio-border/50">
        {/* Auto-Walk Player */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (!isAudioRunning) onStartAudio();
              onToggleAutoScan('normal');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow active:scale-95 ${
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
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">{t.fineTune}</span>
          <button
            onClick={() => nudge(-100)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95"
            title="Step down 100 Hz"
          >
            <ChevronsLeft className="w-3.5 h-3.5 inline mr-0.5" />
            100
          </button>
          <button
            onClick={() => nudge(-10)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95"
            title="Step down 10 Hz"
          >
            <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />
            10
          </button>
          <button
            onClick={() => nudge(10)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95"
            title="Step up 10 Hz"
          >
            +10
            <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
          <button
            onClick={() => nudge(100)}
            className="px-2 py-1 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-lg text-slate-300 active:scale-95"
            title="Step up 100 Hz"
          >
            +100
            <ChevronsRight className="w-3.5 h-3.5 inline ml-0.5" />
          </button>
        </div>
      </div>

      {/* Expanded Quick Jump Frequency Landmarks: Compact, Tight Layout */}
      <div className="flex flex-col gap-2 pt-2 border-t border-studio-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              {t.jumpTitle}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {t.jumpSubtitle}
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center bg-studio-surface rounded-lg border border-studio-border p-0.5 text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2 py-0.5 rounded-md text-[11px] transition ${
                  selectedCategory === cat.key
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tight, Compact Card Grid (3 to 10 columns) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          {filteredLandmarks.map((lm) => {
            const isCurrent = Math.abs(frequency - lm.exactFreq) / lm.exactFreq < 0.025;
            const freqStr = formatFreq(lm.exactFreq);
            const lmName = lang === 'zh' && lm.nameZh ? lm.nameZh : lm.name;
            const lmDesc = lang === 'zh' && lm.descZh ? lm.descZh : lm.desc;

            return (
              <button
                key={lm.exactFreq}
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
