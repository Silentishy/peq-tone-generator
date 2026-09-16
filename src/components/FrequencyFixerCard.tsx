import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Sliders,
  Sparkles,
  Waves,
  Activity,
  Target,
} from 'lucide-react';
import { EQFix, FilterType, FilterWidth } from '../types/audio';
import { WIDTH_MAP, MIN_GAIN, MAX_GAIN } from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface FrequencyFixerCardProps {
  currentFreq: number;
  fixes: EQFix[];
  onSaveFix: (fix: Omit<EQFix, 'id'>) => void;
  onUpdateFix: (fix: EQFix) => void;
  onRemoveFix: (id: string) => void;
  onSelectFrequency?: (freq: number) => void;
  isAudioRunning: boolean;
  onStartAudio: () => void;
  suggestedQ?: number | null;
}

function getWidthFromQ(q: number): FilterWidth {
  if (q >= 3.0) return 'narrow';
  if (q <= 0.9) return 'wide';
  return 'normal';
}

export const FrequencyFixerCard: React.FC<FrequencyFixerCardProps> = ({
  currentFreq,
  fixes,
  onSaveFix,
  onUpdateFix,
  onRemoveFix,
  onSelectFrequency,
  isAudioRunning,
  onStartAudio,
  suggestedQ,
}) => {
  const { t, lang } = useLanguage();
  // Check if there is an existing fix close to this frequency (within 3.5% tolerance)
  const existingFix = fixes.find(
    (f) => Math.abs(f.frequency - currentFreq) / currentFreq < 0.035
  );

  const [gain, setGain] = React.useState<number>(existingFix ? existingFix.gain : -3.0);
  const [filterType, setFilterType] = React.useState<FilterType>(existingFix?.filterType || 'peaking');
  const [qVal, setQVal] = React.useState<number>(
    suggestedQ || existingFix?.q || (existingFix?.filterType === 'lowshelf' ? 0.71 : 1.41)
  );

  // Synchronize state when moving to a frequency that already has a fix, or when suggestedQ is provided
  React.useEffect(() => {
    if (existingFix) {
      setGain(existingFix.gain);
      setFilterType(existingFix.filterType || 'peaking');
      setQVal(suggestedQ || existingFix.q || (existingFix.filterType === 'lowshelf' ? 0.71 : 1.41));
    } else {
      setGain(-3.0);
      setFilterType('peaking');
      setQVal(suggestedQ || 1.41);
    }
  }, [existingFix, currentFreq, suggestedQ]);

  // Live update if editing existing fix - preserves qVal
  const handleGainChange = (newGain: number) => {
    setGain(newGain);
    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        gain: newGain,
        q: qVal,
        width: getWidthFromQ(qVal),
        filterType,
      });
    }
  };

  // Specific Q value adjustment
  const handleQChange = (newQ: number) => {
    const clampedQ = Math.max(0.1, Math.min(25.0, Math.round(newQ * 100) / 100));
    setQVal(clampedQ);
    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        q: clampedQ,
        width: getWidthFromQ(clampedQ),
        filterType,
      });
    }
  };

  const handleShapeChange = (newShape: FilterType) => {
    setFilterType(newShape);
    const targetQ = existingFix ? existingFix.q : newShape === 'lowshelf' ? 0.71 : 1.41;
    setQVal(targetQ);
    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        filterType: newShape,
        q: targetQ,
        width: getWidthFromQ(targetQ),
      });
    }
  };

  const handleApplyFix = (
    suggestedGain: number,
    suggestedQ: number = filterType === 'lowshelf' ? 0.71 : 1.41,
    suggestedType: FilterType = 'peaking'
  ) => {
    if (!isAudioRunning) {
      onStartAudio();
    }

    setGain(suggestedGain);
    setQVal(suggestedQ);
    setFilterType(suggestedType);

    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        frequency: currentFreq,
        gain: suggestedGain,
        q: suggestedQ,
        width: getWidthFromQ(suggestedQ),
        filterType: suggestedType,
      });
    } else {
      onSaveFix({
        frequency: currentFreq,
        gain: suggestedGain,
        q: suggestedQ,
        width: getWidthFromQ(suggestedQ),
        filterType: suggestedType,
        enabled: true,
      });
    }
  };

  const handleAddHarmanShelf = () => {
    if (!isAudioRunning) {
      onStartAudio();
    }
    if (onSelectFrequency) {
      onSelectFrequency(105);
    }

    const harmanFreq = 105;
    const existingHarman = fixes.find(
      (f) => Math.abs(f.frequency - harmanFreq) / harmanFreq < 0.05 && f.filterType === 'lowshelf'
    );

    if (existingHarman) {
      onUpdateFix({
        ...existingHarman,
        gain: 4.5,
        filterType: 'lowshelf',
        q: 0.71,
        width: 'wide',
      });
    } else {
      onSaveFix({
        frequency: 105,
        gain: 4.5,
        filterType: 'lowshelf',
        q: 0.71,
        width: 'wide',
        label: 'Harman Bass Shelf',
        enabled: true,
      });
    }
  };

  const isShelf = filterType === 'lowshelf';

  return (
    <div id="step-2-fixer" className="bg-studio-panel border border-studio-border rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            2
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            {t.step2Title} ({Math.round(currentFreq)} Hz)
          </h2>
        </div>

        {existingFix ? (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border ${
            existingFix.filterType === 'lowshelf'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {existingFix.filterType === 'lowshelf' ? t.bassShelfBadge : t.fixActive}: {existingFix.gain >= 0 ? `+${existingFix.gain}` : existingFix.gain} dB (Q: {existingFix.q.toFixed(2)})
          </span>
        ) : suggestedQ != null ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-sm animate-pulse">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Q: {suggestedQ.toFixed(2)} ({lang === 'zh' ? '三点测算' : '3-Point Measured'})</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            {t.step2Subtitle}
          </span>
        )}
      </div>

      {/* Filter Shape & Preset Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-studio-surface/80 p-2.5 rounded-xl border border-studio-border/70">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300">
            {t.filterShapeLabel}
          </span>
          <div className="flex bg-studio-panel rounded-lg border border-studio-border p-0.5 text-xs font-mono">
            <button
              onClick={() => handleShapeChange('peaking')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'peaking'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.shapeBell}
            </button>
            <button
              onClick={() => handleShapeChange('lowshelf')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'lowshelf'
                  ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.shapeShelf}
            </button>
          </div>
        </div>

        {/* 1-Click Harman Bass Shelf Quick Button */}
        <button
          onClick={handleAddHarmanShelf}
          className="py-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center justify-center space-x-1 active:scale-95 shadow-sm"
          title="Add reference Harman Target bass shelf curve at 105 Hz"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.addHarmanShelfBtn}</span>
        </button>
      </div>

      {/* Main Choice: Too Loud vs Too Quiet vs Balanced */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Too Loud (Peak Cut) */}
        <button
          onClick={() => handleApplyFix(-3.5, isShelf ? 0.71 : (suggestedQ ? qVal : 4.5), filterType)}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition shadow active:scale-95 ${
            existingFix && existingFix.gain < 0
              ? 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
              : 'bg-studio-surface border-studio-border hover:border-rose-400/60 text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span>{t.tooLoudBtn}</span>
        </button>

        {/* Too Quiet (Dip Boost) */}
        <button
          onClick={() => handleApplyFix(3.0, isShelf ? 0.71 : (suggestedQ ? qVal : 1.41), filterType)}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition shadow active:scale-95 ${
            existingFix && existingFix.gain > 0
              ? 'bg-sky-500/20 border-sky-500 text-sky-200 ring-2 ring-sky-500/40'
              : 'bg-studio-surface border-studio-border hover:border-sky-400/60 text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span>{t.tooQuietBtn}</span>
        </button>

        {/* Sounds Normal / Remove Fix */}
        <button
          onClick={() => {
            if (existingFix) onRemoveFix(existingFix.id);
          }}
          disabled={!existingFix}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition ${
            !existingFix
              ? 'bg-studio-surface/50 border-studio-border/60 text-slate-500 opacity-60 cursor-default'
              : 'bg-studio-surface border-studio-border hover:bg-slate-700 text-slate-300 active:scale-95'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t.soundsNormalBtn}</span>
        </button>
      </div>

      {/* Adjuster Drawer (Active when fix exists or being created) */}
      {existingFix && (
        <div className="bg-studio-surface border border-studio-border/80 rounded-2xl p-4 flex flex-col gap-4">
          {filterType === 'lowshelf' && (
            <div className="flex items-center space-x-2 bg-amber-950/20 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-300/90 leading-tight">
              <Waves className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t.bassShelfDesc}</span>
            </div>
          )}

          {/* 1. Live Gain Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                {t.gainLabel}
              </span>
              <span
                className={`text-base font-mono font-black ${
                  gain < 0 ? 'text-rose-400' : gain > 0 ? 'text-sky-400' : 'text-slate-400'
                }`}
              >
                {gain >= 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)} dB
              </span>
            </div>

            <input
              type="range"
              min={MIN_GAIN}
              max={MAX_GAIN}
              step="0.5"
              value={gain}
              onChange={(e) => handleGainChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Quick dB Presets */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span className="text-[11px] text-slate-500">{t.quickPresets}</span>
              <button
                onClick={() => handleGainChange(-6)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-rose-300"
              >
                -6dB
              </button>
              <button
                onClick={() => handleGainChange(-4)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-rose-300"
              >
                -4dB
              </button>
              <button
                onClick={() => handleGainChange(-2)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-rose-300"
              >
                -2dB
              </button>
              <button
                onClick={() => handleGainChange(0)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-slate-300"
              >
                0dB
              </button>
              <button
                onClick={() => handleGainChange(2)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-sky-300"
              >
                +2dB
              </button>
              <button
                onClick={() => handleGainChange(4)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-sky-300"
              >
                +4dB
              </button>
              <button
                onClick={() => handleGainChange(6)}
                className="px-2 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-sky-300"
              >
                +6dB
              </button>
            </div>
          </div>

          {/* 2. Specific Q Value Controller (High Precision with Direct Number Input) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-studio-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t.exactQLabel}</span>
              </div>

              {/* Exact Q Numeric Input + Steppers */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleQChange(qVal - (isShelf ? 0.05 : 0.1))}
                  className="px-1.5 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-slate-300 font-mono text-xs border border-studio-border active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
                  title="Decrease Q by 0.1"
                  aria-label="Decrease Q by 0.1"
                >
                  -0.1
                </button>

                <div className="flex items-center bg-studio-panel border border-cyan-400/80 rounded-lg px-2 py-0.5">
                  <span className="text-xs font-mono text-cyan-400 font-bold mr-1">Q:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="25.0"
                    value={qVal}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) handleQChange(val);
                    }}
                    className="w-16 bg-transparent text-sm font-mono font-black text-cyan-300 focus:outline-none text-right"
                    aria-label="Q factor value"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleQChange(qVal + (isShelf ? 0.05 : 0.1))}
                  className="px-1.5 py-0.5 rounded bg-studio-panel hover:bg-slate-700 text-slate-300 font-mono text-xs border border-studio-border active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
                  title="Increase Q by 0.1"
                  aria-label="Increase Q by 0.1"
                >
                  +0.1
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons for Q */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-mono mr-1">Presets:</span>
              {isShelf ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleQChange(0.5)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 0.5) < 0.03
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    0.50 (Gentle)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQChange(0.71)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 0.71) < 0.03
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    0.71 (Harman/Flat)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQChange(1.0)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 1.0) < 0.03
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    1.00 (Steep)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQChange(1.41)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 1.41) < 0.03
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    1.41 (Resonant)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQChange(0.71)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 0.71) < 0.05
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    0.71 (Wide)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQChange(1.41)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 1.41) < 0.05
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    1.41 (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQChange(4.5)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 4.5) < 0.1
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    4.50 (Narrow)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQChange(8.0)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition ${
                      Math.abs(qVal - 8.0) < 0.1
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
                    }`}
                  >
                    8.00 (Surgical)
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              {isShelf ? t.qNoticeShelf : t.qNoticeBell}
            </p>
          </div>

          {/* Bottom Feedback */}
          <div className="flex items-center justify-between pt-2 border-t border-studio-border/60">
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t.liveFeedback}
            </span>

            <button
              onClick={() => onRemoveFix(existingFix.id)}
              className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.deleteFix}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
