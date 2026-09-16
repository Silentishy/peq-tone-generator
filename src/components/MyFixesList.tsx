import React from 'react';
import { Trash2, Volume2, ListChecks, Edit3 } from 'lucide-react';
import { EQFix } from '../types/audio';
import { WIDTH_MAP } from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface MyFixesListProps {
  fixes: EQFix[];
  currentFreq?: number;
  onSelectFix: (freq: number) => void;
  onRemoveFix: (id: string) => void;
  onClearAll: () => void;
}

export const MyFixesList: React.FC<MyFixesListProps> = ({
  fixes,
  currentFreq,
  onSelectFix,
  onRemoveFix,
  onClearAll,
}) => {
  const { t, lang } = useLanguage();

  const getWidthLabel = (w: 'narrow' | 'normal' | 'wide') => {
    if (lang === 'zh') {
      return w === 'narrow' ? '窄频' : w === 'normal' ? '标准' : '宽频';
    }
    return WIDTH_MAP[w].label;
  };

  return (
    <div id="step-5-ledger" className="bg-studio-panel border border-studio-border rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-studio-border/60 pb-2.5 sm:pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            5
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-cyan-400" />
            {t.step5SectionTitle} ({fixes.length})
          </h2>
        </div>

        {fixes.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1 rounded-lg px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-rose-400 focus:outline-none"
            aria-label={t.clearAll}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearAll}</span>
          </button>
        )}
      </div>

      {fixes.length === 0 ? (
        <div className="py-5 sm:py-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
          <p className="max-w-md text-slate-400 leading-relaxed">
            {t.noFixesYet}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 sm:max-h-72 lg:max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {fixes.map((fix) => {
            const isCut = fix.gain < 0;
            const isShelf = fix.filterType === 'lowshelf';
            const isSelected = currentFreq !== undefined && Math.abs(fix.frequency - currentFreq) / fix.frequency < 0.035;

            return (
              <div
                key={fix.id}
                onClick={() => onSelectFix(fix.frequency)}
                className={`cursor-pointer rounded-xl p-3 flex items-center justify-between gap-2 border transition-all active:scale-[0.99] group ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                    : 'bg-studio-surface border-studio-border hover:border-cyan-500/60 hover:bg-studio-surface/90'
                }`}
                title={lang === 'zh' ? '点击载入步骤2进行微调' : 'Click to load into Step 2 for editing'}
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isShelf
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                          : isCut
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : 'bg-sky-400 shadow-sm shadow-sky-400/50'
                      }`}
                    />
                    <span className="font-mono text-sm font-bold text-slate-200">
                      {Math.round(fix.frequency)} Hz
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isShelf ? 'text-amber-400' : isCut ? 'text-rose-400' : 'text-sky-400'
                      }`}
                    >
                      {fix.gain >= 0 ? `+${fix.gain.toFixed(1)}` : fix.gain.toFixed(1)} dB
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {isShelf
                      ? `${t.bassShelfBadge} • Q: ${fix.q.toFixed(2)}`
                      : `${isCut ? t.peakCut : t.dipBoost} • ${getWidthLabel(fix.width)} (Q: ${fix.q.toFixed(2)})`}
                  </span>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="p-1.5 rounded-lg text-slate-400 group-hover:text-cyan-300 transition">
                    <Edit3 className="w-3.5 h-3.5" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFix(fix.id);
                    }}
                    className="p-1.5 hover:bg-slate-700 text-slate-500 hover:text-rose-400 rounded-lg transition focus-visible:ring-2 focus-visible:ring-rose-400 focus:outline-none"
                    title={t.deleteTooltip}
                    aria-label={`${t.deleteTooltip} (${Math.round(fix.frequency)} Hz)`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
