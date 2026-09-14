import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Smartphone, Monitor, Sliders } from 'lucide-react';
import { EQFix } from '../types/audio';
import { exportToEqualizerAPO, exportToWavelet, exportToTable } from '../utils/eqMath';
import { useLanguage } from '../context/LanguageContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixes: EQFix[];
}

type TabType = 'apo' | 'wavelet' | 'table';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, fixes }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('apo');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  let exportContent = '';
  let fileName = 'my_headphone_eq.txt';
  let appTitle = t.apoTitle;
  let instructions = t.apoDesc;

  if (activeTab === 'apo') {
    exportContent = exportToEqualizerAPO(fixes);
    fileName = 'peace_config.txt';
    appTitle = t.apoTitle;
    instructions = t.apoDesc;
  } else if (activeTab === 'wavelet') {
    exportContent = exportToWavelet(fixes);
    fileName = 'wavelet_eq.txt';
    appTitle = t.waveletTitle;
    instructions = t.waveletDesc;
  } else {
    exportContent = exportToTable(fixes);
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
        <div className="flex border-b border-studio-border px-4 pt-2 bg-studio-surface/50 gap-2">
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
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          <p className="text-xs text-slate-300 bg-studio-surface p-3 rounded-xl border border-studio-border/70 leading-relaxed">
            <strong className="text-cyan-300 block mb-0.5">{appTitle}:</strong>
            {instructions}
          </p>

          <div className="relative">
            <textarea
              readOnly
              value={exportContent}
              rows={8}
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
        </div>
      </div>
    </div>
  );
};
