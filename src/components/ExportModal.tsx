import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Smartphone,
  Monitor,
  Sliders,
  Upload,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { EQFix } from '../types/audio';
import {
  exportToEqualizerAPO,
  exportToWavelet,
  exportToTable,
  calculateHeadroom,
  importFromEqualizerAPO,
} from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixes: EQFix[];
  preamp: number;
  autoPreamp: boolean;
  onUpdatePreamp: (val: number, auto: boolean) => void;
  onImportFixes: (imported: Partial<EQFix>[], parsedPreamp?: number) => void;
}

type TabType = 'apo' | 'wavelet' | 'table' | 'import';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  fixes,
  preamp,
  autoPreamp,
  onUpdatePreamp,
  onImportFixes,
}) => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('apo');
  const [copied, setCopied] = useState<boolean>(false);

  // Import state
  const [importText, setImportText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const { maxBoost, suggestedPreamp } = calculateHeadroom(fixes);
  const effectivePreamp = autoPreamp ? suggestedPreamp : preamp;

  let exportContent = '';
  let fileName = 'my_headphone_eq.txt';
  let appTitle = t.apoTitle;
  let instructions = t.apoDesc;

  if (activeTab === 'apo') {
    exportContent = exportToEqualizerAPO(fixes, effectivePreamp);
    fileName = 'peace_config.txt';
    appTitle = t.apoTitle;
    instructions = t.apoDesc;
  } else if (activeTab === 'wavelet') {
    exportContent = exportToWavelet(fixes, effectivePreamp);
    fileName = 'wavelet_eq.txt';
    appTitle = t.waveletTitle;
    instructions = t.waveletDesc;
  } else if (activeTab === 'table') {
    exportContent = exportToTable(fixes, effectivePreamp);
    fileName = 'eq_settings.txt';
    appTitle = t.tableTitle;
    instructions = t.tableDesc;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    setImportError(null);
    setImportSuccess(false);

    if (!importText.trim()) return;

    const { fixes: parsedFixes, preamp: parsedPreamp } = importFromEqualizerAPO(importText);
    if (parsedFixes.length === 0) {
      setImportError(t.importError);
      return;
    }

    onImportFixes(parsedFixes, parsedPreamp);
    setImportSuccess(true);
    setImportText('');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-studio-border bg-studio-surface">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {t.exportModalTitle} ({fixes.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-studio-border px-4 pt-2 bg-studio-surface/50 gap-2">
          <button
            onClick={() => setActiveTab('apo')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'apo'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t.tabWindows}</span>
          </button>

          <button
            onClick={() => setActiveTab('wavelet')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'wavelet'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.tabAndroid}</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'table'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabUniversal}</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.tabImport}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          {activeTab !== 'import' ? (
            /* Export Mode */
            <>
              {/* Headroom / Preamp Setting Box */}
              <div className="bg-studio-surface border border-studio-border/70 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t.preampSetting}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {effectivePreamp >= 0 ? `+${effectivePreamp.toFixed(1)}` : effectivePreamp.toFixed(1)} dB
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-preamp-check"
                    checked={autoPreamp}
                    onChange={(e) => onUpdatePreamp(preamp, e.target.checked)}
                    className="rounded accent-cyan-400 cursor-pointer"
                  />
                  <label htmlFor="auto-preamp-check" className="text-xs text-slate-300 cursor-pointer select-none">
                    {t.autoPreampLabel}
                  </label>
                </div>

                {maxBoost > 0 && autoPreamp && (
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {lang === 'zh'
                      ? `检测到当前 EQ 最大提升为 +${maxBoost.toFixed(1)} dB，已自动应用 ${suggestedPreamp.toFixed(1)} dB 前级负增益以防破音。`
                      : `Max boost is +${maxBoost.toFixed(1)} dB. An offset of ${suggestedPreamp.toFixed(1)} dB is applied to avoid 0 dBFS clipping.`}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-300 bg-studio-surface p-3 rounded-xl border border-studio-border/70 leading-relaxed">
                <strong className="text-cyan-300 block mb-0.5">{appTitle}:</strong>
                {instructions}
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  value={exportContent}
                  rows={7}
                  className="w-full bg-studio-surface border border-studio-border rounded-xl p-3 text-xs font-mono text-cyan-300 select-all focus:outline-none scrollbar-thin leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-xl text-xs text-slate-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadFile}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-950/40 transition active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.copiedSuccess : t.copyClipboard}</span>
                </button>
              </div>
            </>
          ) : (
            /* Reverse Import Mode */
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-300 bg-studio-surface p-3 rounded-xl border border-studio-border/70 leading-relaxed">
                <strong className="text-emerald-300 block mb-0.5">{t.importTitle}</strong>
                {t.importDesc}
              </p>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={t.importPlaceholder}
                rows={9}
                className="w-full bg-studio-surface border border-studio-border rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 scrollbar-thin leading-relaxed"
              />

              {importError && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 font-mono bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center space-x-2 text-xs text-emerald-300 font-mono bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl">
                  <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{t.importSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={handleApplyImport}
                  disabled={!importText.trim()}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-950/40 transition active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.importBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
