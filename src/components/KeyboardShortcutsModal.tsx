import React from 'react';
import { X, Keyboard, ArrowLeftRight, ArrowUpDown, Play, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, lang } = useLanguage();
  if (!isOpen) return null;

  const shortcuts = [
    {
      keys: ['Space'],
      desc: t.shortcutSpaceDesc,
      tag: 'Play/Pause',
    },
    {
      keys: ['←', '→'],
      desc: t.shortcutArrowsLRDesc,
      tag: 'Freq ±10 Hz',
    },
    {
      keys: ['Shift', '← / →'],
      desc: t.shortcutArrowsShiftLRDesc,
      tag: 'Freq ±100 Hz',
    },
    {
      keys: ['↑', '↓'],
      desc: t.shortcutArrowsUDSDesc,
      tag: 'Gain ±0.5 dB',
    },
    {
      keys: ['B'],
      desc: t.shortcutBDesc,
      tag: 'A/B Compare',
    },
    {
      keys: ['S'],
      desc: t.shortcutSDesc,
      tag: 'Auto-Scan',
    },
    {
      keys: ['Ctrl / ⌘', 'Z'],
      desc: t.shortcutUndoDesc,
      tag: 'Undo',
    },
    {
      keys: ['Shift + Ctrl / ⌘', 'Z'],
      desc: t.shortcutRedoDesc,
      tag: 'Redo',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-studio-border bg-studio-surface">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {t.shortcutsTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t.shortcutCloseBtn || 'Close'}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-3">
          <p className="text-xs text-slate-400 mb-1 leading-relaxed">
            {lang === 'zh'
              ? '戴上耳机调音时，闭上眼睛聆听能最大程度提高注意力。利用以下快捷键即可实现无视觉盲听操作：'
              : 'Closing your eyes while wearing headphones maximizes hearing focus. Use these keyboard shortcuts for hands-free, eyes-closed tuning:'}
          </p>

          <div className="flex flex-col gap-2">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-studio-surface border border-studio-border/70 text-xs"
              >
                <div className="flex items-center space-x-1.5">
                  {sc.keys.map((k, ki) => (
                    <kbd
                      key={ki}
                      className="px-2.5 py-1 rounded-lg bg-studio-panel border border-slate-700 font-mono font-bold text-cyan-300 text-xs shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-slate-300 font-medium ml-3 text-right">
                  {sc.desc}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-3 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95"
          >
            {t.shortcutCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
