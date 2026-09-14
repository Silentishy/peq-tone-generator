import React from 'react';
import { Trash2, Volume2, ListChecks, ArrowRight } from 'lucide-react';
import { EQFix } from '../types/audio';
import { WIDTH_MAP } from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface MyFixesListProps {
  fixes: EQFix[];
  onSelectFix: (freq: number) => void;
  onRemoveFix: (id: string) => void;
  onClearAll: () => void;
}

export const MyFixesList: React.FC<MyFixesListProps> = ({
  fixes,
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
    <div className="bg-studio-panel border border-studio-border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-studio-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            4
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-cyan-400" />
            {t.step4Title} ({fixes.length})
          </h2>
        </div>

        {fixes.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearAll}</span>
          </button>
        )}
      </div>

      {fixes.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
          <p className="max-w-md text-slate-400 leading-relaxed">
            {t.noFixesYet}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
          {fixes.map((fix) => {
            const isCut = fix.gain < 0;
            return (
              <div
                key={fix.id}
                className="bg-studio-surface border border-studio-border rounded-xl p-3 flex items-center justify-between gap-2 hover:border-slate-600 transition"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCut ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-sky-400 shadow-sm shadow-sky-400/50'
                      }`}
                    />
                    <span className="font-mono text-sm font-bold text-slate-200">
                      {Math.round(fix.frequency)} Hz
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isCut ? 'text-rose-400' : 'text-sky-400'
                      }`}
                    >
                      {fix.gain >= 0 ? `+${fix.gain.toFixed(1)}` : fix.gain.toFixed(1)} dB
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {isCut ? t.peakCut : t.dipBoost} • {getWidthLabel(fix.width)} (Q: {fix.q.toFixed(2)})
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onSelectFix(fix.frequency)}
                    className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 rounded-lg transition"
                    title={t.listenTooltip}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveFix(fix.id)}
                    className="p-1.5 hover:bg-slate-700 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    title={t.deleteTooltip}
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
