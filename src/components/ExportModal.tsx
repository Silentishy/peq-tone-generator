import React, { useState, useRef } from 'react';
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
  FolderOpen,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { EQFix, FilterType } from '../types/audio';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [parsedSummary, setParsedSummary] = useState<{
    count: number;
    preamp?: number;
    preview: { freq: number; gain: number; filterType?: FilterType }[];
  } | null>(null);
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

  const processFileContent = (content: string, name?: string) => {
    setImportError(null);
    setImportSuccess(false);
    setImportText(content);
    if (name) setImportFileName(name);

    const { fixes: parsedFixes, preamp: parsedPreamp } = importFromEqualizerAPO(content);
    if (parsedFixes.length === 0) {
      setParsedSummary(null);
      setImportError(t.importError);
      return;
    }

    setParsedSummary({
      count: parsedFixes.length,
      preamp: parsedPreamp,
      preview: parsedFixes
        .filter((f) => f.frequency && f.gain !== undefined)
        .slice(0, 8)
        .map((f) => ({ freq: f.frequency!, gain: f.gain!, filterType: f.filterType })),
    });
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const text = await file.text();
        processFileContent(text, file.name);
      } catch (err) {
        setImportError('Failed to read file.');
      }
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        const text = await file.text();
        processFileContent(text, file.name);
      } catch (err) {
        setImportError('Failed to read file.');
      }
    }
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
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="bg-studio-panel border border-studio-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-studio-border bg-studio-surface">
          <div className="flex items-center space-x-2 min-w-0">
            <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <h3 className="font-bold text-slate-100 text-sm truncate">
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
        <div className="flex flex-wrap border-b border-studio-border px-3 sm:px-4 pt-2 bg-studio-surface/50 gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('apo')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold border-b-2 transition ${
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
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold border-b-2 transition ${
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
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold border-b-2 transition ${
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
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold border-b-2 transition ${
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
        <div className="p-3.5 sm:p-4 flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-thin">
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
                  className="flex items-center space-x-1.5 px-3 py-2 bg-studio-surface hover:bg-slate-700 border border-studio-border rounded-xl text-xs text-slate-300 transition active:scale-95"
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
            /* Direct File Import & Snippet Mode */
            <div className="flex flex-col gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".txt,.json,.csv,.req,.peace,.apo,text/plain,application/json"
                className="hidden"
              />

              {/* Direct File Dropzone */}
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-studio-border hover:border-emerald-500/60 rounded-2xl p-5 sm:p-6 bg-studio-surface/60 hover:bg-studio-surface transition flex flex-col items-center justify-center gap-2 text-center cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {t.importDropzone}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.importDropzoneFormats}
                  </p>
                </div>
              </div>

              {/* Parsed Summary Card */}
              {parsedSummary && (
                <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {importFileName ? `${importFileName} • ` : ''}
                      {lang === 'zh'
                        ? `成功解析 ${parsedSummary.count} 个滤镜频点`
                        : `${parsedSummary.count} filters parsed`}
                    </span>
                    {parsedSummary.preamp !== undefined && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Preamp: {parsedSummary.preamp >= 0 ? '+' : ''}{parsedSummary.preamp} dB
                      </span>
                    )}
                  </div>

                  {/* Filter preview tags */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {parsedSummary.preview.map((f, i) => {
                      const isShelf = f.filterType === 'lowshelf';
                      return (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${
                            isShelf
                              ? 'bg-amber-950/30 text-amber-300 border-amber-500/40'
                              : 'bg-studio-surface text-slate-300 border-studio-border'
                          }`}
                        >
                          <span>{f.freq >= 1000 ? `${(f.freq / 1000).toFixed(1)}k` : `${f.freq}`}Hz</span>
                          <strong
                            className={
                              isShelf
                                ? 'text-amber-400'
                                : f.gain >= 0
                                ? 'text-sky-400'
                                : 'text-rose-400'
                            }
                          >
                            {f.gain >= 0 ? `+${f.gain}` : f.gain}dB
                          </strong>
                          {isShelf && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans">
                              {lang === 'zh' ? '低音搁架' : 'Shelf'}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {parsedSummary.count > 8 && (
                      <span className="text-[10px] text-slate-400 font-mono py-0.5">
                        +{parsedSummary.count - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Always-visible Manual Raw Text Snippet Area */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-studio-border/60">
                <span className="text-xs font-semibold text-slate-300">
                  {t.importOrPasteSnippet}
                </span>
                <textarea
                  value={importText}
                  onChange={(e) => processFileContent(e.target.value)}
                  placeholder={t.importPlaceholder}
                  rows={6}
                  className="w-full bg-studio-surface border border-studio-border rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 scrollbar-thin leading-relaxed"
                />
              </div>

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

              <div className="flex items-center justify-end space-x-2 pt-1">
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
