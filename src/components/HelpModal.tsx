import React from 'react';
import { X, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-studio-border bg-studio-surface">
          <div className="flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {t.helpModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close help guide"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                {t.helpStep1Title}
              </h4>
              <p className="text-slate-400">
                {t.helpStep1Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                {t.helpStep2Title}
              </h4>
              <p className="text-slate-400">
                {t.helpStep2Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                {t.helpStep3Title}
              </h4>
              <p className="text-slate-400">
                {t.helpStep3Desc}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm mb-0.5">
                {t.helpStep4Title}
              </h4>
              <p className="text-slate-400">
                {t.helpStep4Desc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            {t.helpCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
