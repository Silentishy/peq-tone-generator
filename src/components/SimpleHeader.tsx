import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  ShieldCheck,
  Share2,
  Headphones,
  HelpCircle,
  Languages as LanguagesIcon,
  ChevronDown,
  Check,
  Keyboard,
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { ProfileSelector } from './ProfileSelector';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/i18n';
import { EQProfile } from '../types/audio';

interface SimpleHeaderProps {
  isAudioRunning: boolean;
  onToggleAudio: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isBypassed: boolean;
  onToggleBypass: () => void;
  fixesCount: number;
  onOpenExport: () => void;
  onOpenHelp: () => void;
  onOpenShortcuts: () => void;
  profiles: EQProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onRenameProfile: (id: string, name: string) => void;
  onDeleteProfile: (id: string) => void;
  effectivePreamp: number;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; subLabel: string }[] = [
  { code: 'en', label: 'English', subLabel: 'English' },
  { code: 'zh', label: '简体中文', subLabel: 'Simplified Chinese' },
];

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  isAudioRunning,
  onToggleAudio,
  volume,
  onVolumeChange,
  isBypassed,
  onToggleBypass,
  fixesCount,
  onOpenExport,
  onOpenHelp,
  onOpenShortcuts,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  effectivePreamp,
}) => {
  const { t, lang, setLang } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);

  return (
    <header className="bg-studio-surface border-b border-studio-border px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-slate-100 shadow-md">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Guide row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white leading-none">
                  {t.appTitle}
                </h1>
                <button
                  onClick={onOpenHelp}
                  className="text-slate-400 hover:text-cyan-300 transition"
                  title={t.helpTooltip}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenShortcuts}
                  className="text-slate-400 hover:text-cyan-300 transition"
                  title={t.shortcutsTooltip}
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Mobile-only Utility Cluster (Language + GitHub) */}
          <div className="flex items-center space-x-1.5 md:hidden">
            {/* Language Menu Dropdown on Mobile */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-studio-panel border border-studio-border text-xs font-semibold text-slate-300"
              >
                <LanguagesIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[11px]">{lang === 'zh' ? '中' : 'EN'}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-studio-panel border border-studio-border shadow-2xl py-1 z-50">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLang(opt.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left ${
                        lang === opt.code ? 'bg-cyan-500/15 text-cyan-300 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {lang === opt.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="https://github.com/Silentishy/peq-tone-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-studio-panel border border-studio-border text-slate-400 hover:text-white"
              title="GitHub"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Center/Right Control Cluster (Profile, Play/Stop, Volume, A/B, Export) */}
        <div className="flex items-center flex-wrap justify-between md:justify-end gap-2 sm:gap-2.5">
          {/* Device Profile Selector */}
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={onSelectProfile}
            onCreateProfile={onCreateProfile}
            onRenameProfile={onRenameProfile}
            onDeleteProfile={onDeleteProfile}
          />

          {/* Big Start / Stop Tone Button */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
              isAudioRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 ring-2 ring-rose-400/40 animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40 font-black'
            }`}
          >
            {isAudioRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stopTone}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.playTone}</span>
              </>
            )}
          </button>

          {/* Volume & Headroom Display */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-studio-panel px-2.5 sm:px-3 py-1.5 rounded-xl border border-studio-border">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 0.25 : 0)}
              className="text-slate-400 hover:text-cyan-400 transition"
              title="Mute / Unmute"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 lg:w-24 h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
              title={t.volume}
            />
            <span className="text-[11px] sm:text-xs font-mono text-slate-300 w-7 text-right">
              {Math.round(volume * 100)}%
            </span>

            {/* Preamp Headroom Status Badge */}
            <div
              className={`hidden xl:flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                effectivePreamp < 0
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
              title={`${t.headroomLabel} ${effectivePreamp >= 0 ? '+' : ''}${effectivePreamp.toFixed(1)} dB`}
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>{effectivePreamp < 0 ? `${effectivePreamp.toFixed(1)}dB` : t.safeLimit}</span>
            </div>
          </div>

          {/* Desktop Language Switcher */}
          <div className="relative hidden md:block" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              className={`flex items-center space-x-1 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                isLangMenuOpen
                  ? 'bg-studio-panel border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-studio-panel hover:bg-slate-700 text-slate-300 hover:text-white border-studio-border'
              }`}
              aria-expanded={isLangMenuOpen}
              aria-haspopup="true"
              title={lang === 'en' ? 'Select language' : '选择语言'}
            >
              <LanguagesIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{lang === 'zh' ? '简体中文' : 'English'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isLangMenuOpen ? 'rotate-180 text-cyan-300' : ''
                }`}
              />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-studio-panel border border-studio-border shadow-2xl py-1.5 z-50 backdrop-blur-md">
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-studio-border/60 mb-1">
                  {lang === 'zh' ? '选择界面语言' : 'Select Language'}
                </div>
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = lang === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => {
                        setLang(opt.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition ${
                        isSelected
                          ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-studio-surface hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {opt.subLabel}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* A/B Compare Switch */}
          <button
            onClick={onToggleBypass}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 ${
              isBypassed
                ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-bold'
                : 'bg-studio-panel border-studio-border text-slate-300 hover:text-white'
            }`}
            title={t.bypassTooltip}
          >
            <span className="w-2 h-2 rounded-full bg-current inline-block" />
            <span>{isBypassed ? t.bypassOn : t.bypassOff}</span>
          </button>

          {/* Export / Import Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-950/40 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.exportFixes}</span>
            {fixesCount > 0 && (
              <span className="ml-0.5 sm:ml-1 px-1.5 py-0.2 bg-slate-950 text-cyan-300 rounded-full text-[10px] font-mono">
                {fixesCount}
              </span>
            )}
          </button>

          {/* Desktop GitHub Link */}
          <a
            href="https://github.com/Silentishy/peq-tone-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-studio-panel hover:bg-slate-700 text-slate-300 hover:text-white border border-studio-border text-xs font-semibold transition active:scale-95"
            title="View source code on GitHub"
          >
            <GitHubIcon className="w-4 h-4 text-slate-300" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
