import React from 'react';
import {
  VolumeX,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { EQFix, FilterWidth } from '../types/audio';
import { WIDTH_MAP, MIN_GAIN, MAX_GAIN } from '../utils/eqMath';

interface FrequencyFixerCardProps {
  currentFreq: number;
  fixes: EQFix[];
  onSaveFix: (fix: Omit<EQFix, 'id'>) => void;
  onUpdateFix: (fix: EQFix) => void;
  onRemoveFix: (id: string) => void;
  isAudioRunning: boolean;
  onStartAudio: () => void;
}

export const FrequencyFixerCard: React.FC<FrequencyFixerCardProps> = ({
  currentFreq,
  fixes,
  onSaveFix,
  onUpdateFix,
  onRemoveFix,
  isAudioRunning,
  onStartAudio,
}) => {
  // Check if there is an existing fix close to this frequency (within 3% tolerance)
  const existingFix = fixes.find(
    (f) => Math.abs(f.frequency - currentFreq) / currentFreq < 0.035
  );

  const [gain, setGain] = React.useState<number>(existingFix ? existingFix.gain : -3.0);
  const [width, setWidth] = React.useState<FilterWidth>(existingFix ? existingFix.width : 'normal');

  // Synchronize state when moving to a frequency that already has a fix
  React.useEffect(() => {
    if (existingFix) {
      setGain(existingFix.gain);
      setWidth(existingFix.width);
    } else {
      setGain(-3.0);
      setWidth('normal');
    }
  }, [existingFix, currentFreq]);

  // Live update if editing existing fix
  const handleGainChange = (newGain: number) => {
    setGain(newGain);
    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        gain: newGain,
        width,
        q: WIDTH_MAP[width].q,
      });
    }
  };

  const handleWidthChange = (newWidth: FilterWidth) => {
    setWidth(newWidth);
    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        width: newWidth,
        q: WIDTH_MAP[newWidth].q,
      });
    }
  };

  const handleApplyFix = (suggestedGain: number, suggestedWidth: FilterWidth = 'normal') => {
    if (!isAudioRunning) {
      onStartAudio();
    }

    setGain(suggestedGain);
    setWidth(suggestedWidth);

    if (existingFix) {
      onUpdateFix({
        ...existingFix,
        frequency: currentFreq,
        gain: suggestedGain,
        width: suggestedWidth,
        q: WIDTH_MAP[suggestedWidth].q,
      });
    } else {
      onSaveFix({
        frequency: currentFreq,
        gain: suggestedGain,
        width: suggestedWidth,
        q: WIDTH_MAP[suggestedWidth].q,
        enabled: true,
      });
    }
  };

  return (
    <div className="bg-studio-panel border border-studio-border rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            2
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Fix This Frequency ({Math.round(currentFreq)} Hz)
          </h2>
        </div>

        {existingFix ? (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Fix Active: {existingFix.gain >= 0 ? `+${existingFix.gain}` : existingFix.gain} dB
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            How does this frequency sound compared to the rest?
          </span>
        )}
      </div>

      {/* Main Choice: Too Loud vs Too Quiet vs Balanced */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Too Loud (Peak Cut) */}
        <button
          onClick={() => handleApplyFix(-3.5, 'narrow')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition shadow active:scale-95 ${
            existingFix && existingFix.gain < 0
              ? 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
              : 'bg-studio-surface border-studio-border hover:border-rose-400/60 text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span>TOO LOUD (CUT PEAK)</span>
        </button>

        {/* Too Quiet (Dip Boost) */}
        <button
          onClick={() => handleApplyFix(3.0, 'normal')}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition shadow active:scale-95 ${
            existingFix && existingFix.gain > 0
              ? 'bg-sky-500/20 border-sky-500 text-sky-200 ring-2 ring-sky-500/40'
              : 'bg-studio-surface border-studio-border hover:border-sky-400/60 text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <span>TOO QUIET (BOOST DIP)</span>
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
          <span>SOUNDS NORMAL (NO FIX)</span>
        </button>
      </div>

      {/* Adjuster Drawer (Active when fix exists or being created) */}
      {existingFix && (
        <div className="bg-studio-surface border border-studio-border/80 rounded-2xl p-4 flex flex-col gap-4">
          {/* Live Gain Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Loudness Adjustment (dB):
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
              <span className="text-[11px] text-slate-500">Quick:</span>
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

          {/* Width / Sharpness Options */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Filter Width:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['narrow', 'normal', 'wide'] as FilterWidth[]).map((wKey) => {
                const info = WIDTH_MAP[wKey];
                const isSelected = width === wKey;
                return (
                  <button
                    key={wKey}
                    onClick={() => handleWidthChange(wKey)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                        : 'bg-studio-panel border-studio-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block">{info.label}</span>
                    <span className="text-[11px] text-slate-400 mt-1 leading-tight block">
                      {info.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Feedback */}
          <div className="flex items-center justify-between pt-2 border-t border-studio-border/60">
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live sound updated! Listen through your headphones.
            </span>

            <button
              onClick={() => onRemoveFix(existingFix.id)}
              className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Fix</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
