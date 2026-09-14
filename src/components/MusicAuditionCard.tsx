import React, { useRef } from 'react';
import {
  Music,
  Upload,
  Play,
  Pause,
  Repeat,
  RotateCcw,
  RotateCw,
  FolderOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MusicState } from '../audio/AudioEngine';

interface MusicAuditionCardProps {
  musicState: MusicState;
  onUploadFile: (file: File) => void;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onToggleLoop: () => void;
  isBypassed: boolean;
  onToggleBypass: () => void;
  fixesCount: number;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const MusicAuditionCard: React.FC<MusicAuditionCardProps> = ({
  musicState,
  onUploadFile,
  onTogglePlay,
  onSeek,
  onToggleLoop,
  isBypassed,
  onToggleBypass,
  fixesCount,
}) => {
  const { t, lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || /\.(mp3|wav|flac|aac|m4a|ogg|opus)$/i.test(file.name)) {
        onUploadFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const skip = (delta: number) => {
    onSeek(musicState.currentTime + delta);
  };

  return (
    <div className="bg-studio-panel border border-studio-border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/40">
            3
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-cyan-400" />
            {t.musicAuditionTitle}
          </h2>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-studio-surface hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-studio-border transition active:scale-95 shadow-sm"
          title={t.uploadMusicDesc}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{musicState.isLoaded ? t.changeMusic : t.uploadMusicBtn}</span>
        </button>
      </div>

      <p className="text-xs text-slate-400">
        {t.musicAuditionSubtitle}
      </p>

      {/* Main Music Player Box */}
      {!musicState.isLoaded ? (
        /* Empty Upload Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-studio-border hover:border-cyan-500/60 rounded-2xl p-6 sm:p-8 bg-studio-surface/50 hover:bg-studio-surface transition flex flex-col items-center justify-center gap-2 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              {lang === 'zh' ? '点击或拖拽音频文件到此处' : 'Click or Drag & Drop audio file here'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.uploadMusicDesc}
            </p>
          </div>
        </div>
      ) : (
        /* Active Player Controls */
        <div className="bg-studio-surface border border-studio-border rounded-2xl p-4 flex flex-col gap-3.5">
          {/* Track Title & Playing Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                  musicState.isPlaying
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-studio-panel text-slate-400 border border-studio-border'
                }`}
              >
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
                  {musicState.fileName}
                </h4>
                <span className="text-[11px] font-mono text-cyan-400">
                  {musicState.isPlaying ? (lang === 'zh' ? '正在播放 (通过EQ滤镜)' : 'Playing through EQ') : (lang === 'zh' ? '已暂停' : 'Paused')}
                </span>
              </div>
            </div>

            {/* Loop Toggle Button */}
            <button
              onClick={onToggleLoop}
              className={`p-2 rounded-xl border text-xs transition ${
                musicState.isLooping
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-studio-panel border-studio-border text-slate-500 hover:text-slate-300'
              }`}
              title={t.loopTooltip}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time & Scrub Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(musicState.currentTime)}</span>
              <span>{formatTime(musicState.duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={musicState.duration || 100}
              step="0.1"
              value={musicState.currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-center space-x-3 pt-1">
            <button
              onClick={() => skip(-5)}
              className="px-2.5 py-1.5 rounded-xl bg-studio-panel hover:bg-slate-700 text-slate-300 border border-studio-border text-xs font-mono transition active:scale-95"
              title="Rewind 5 seconds"
            >
              {t.rewind5s}
            </button>

            {/* Big Music Play/Pause */}
            <button
              onClick={onTogglePlay}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                musicState.isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-950/40'
              }`}
            >
              {musicState.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{t.pauseMusic}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.playMusic}</span>
                </>
              )}
            </button>

            <button
              onClick={() => skip(5)}
              className="px-2.5 py-1.5 rounded-xl bg-studio-panel hover:bg-slate-700 text-slate-300 border border-studio-border text-xs font-mono transition active:scale-95"
              title="Forward 5 seconds"
            >
              {t.forward5s}
            </button>
          </div>

          {/* Instant A/B Blind Compare Card */}
          <div className="mt-1 pt-3 border-t border-studio-border/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                {t.abCompareTitle}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {fixesCount > 0 ? (lang === 'zh' ? `${fixesCount} 个修正生效中` : `${fixesCount} fixes active`) : (lang === 'zh' ? '暂无修正' : '0 fixes')}
              </span>
            </div>

            <button
              onClick={onToggleBypass}
              className={`w-full p-3 rounded-xl border text-xs font-bold transition-all shadow flex items-center justify-between active:scale-[0.99] ${
                !isBypassed
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-500/30'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    !isBypassed ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-sm tracking-wide">
                  {!isBypassed ? t.musicEqOn : t.musicBypass}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {lang === 'zh' ? '点击即时切换' : 'Click to toggle'}
              </span>
            </button>

            <p className="text-[11px] text-slate-400 leading-tight">
              {t.abCompareDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
