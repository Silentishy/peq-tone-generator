import React from 'react';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  ShieldCheck,
  Share2,
  Headphones,
  CheckCircle2,
  HelpCircle,
  Languages as LanguagesIcon,
} from 'lucide-react';
import { GitHubIcon } from './GitHubIcon';
import { useLanguage } from '../context/LanguageContext';

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
}

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
}) => {
  const { t, lang, toggleLang } = useLanguage();

  return (
    <header className="bg-studio-surface border-b border-studio-border px-4 lg:px-6 py-3 text-slate-100 shadow-md">
      <div className="max-w-[1600px] w-full mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Guide */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base tracking-tight text-white">
                {t.appTitle}
              </h1>
              <button
                onClick={onOpenHelp}
                className="text-slate-400 hover:text-cyan-300 transition"
                title={t.helpTooltip}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Center: Play/Stop & Volume */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Big Start / Stop Listening Button */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isAudioRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 ring-2 ring-rose-400/40 animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40 font-black'
            }`}
          >
            {isAudioRunning ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>{t.stopTone}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t.playTone}</span>
              </>
            )}
          </button>

          {/* Volume & Ear Safety */}
          <div className="flex items-center space-x-2 bg-studio-panel px-3 py-2 rounded-xl border border-studio-border">
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
              className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
              title={t.volume}
            />
            <span className="text-xs font-mono text-slate-300 w-9 text-right">
              {Math.round(volume * 100)}%
            </span>
            <div
              className="hidden sm:flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              title={t.safeTooltip}
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              {t.safeLimit}
            </div>
          </div>
        </div>

        {/* Right: Language Toggle, A/B Compare Toggle & Export Button */}
        <div className="flex items-center space-x-2">
          {/* Language Switch Button */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-studio-panel hover:bg-slate-700 text-slate-300 hover:text-white border border-studio-border text-xs font-medium transition active:scale-95"
            title={lang === 'en' ? '切换为中文界面' : 'Switch to English'}
          >
            <LanguagesIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-bold">{lang === 'en' ? '中文' : 'EN'}</span>
          </button>

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

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-950/40 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.exportFixes}</span>
            {fixesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-slate-950 text-cyan-300 rounded-full text-[10px] font-mono">
                {fixesCount}
              </span>
            )}
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Silentishy/peq-tone-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-studio-panel hover:bg-slate-700 text-slate-300 hover:text-white border border-studio-border text-xs font-semibold transition active:scale-95"
            title="View source code & documentation on GitHub"
          >
            <GitHubIcon className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
