import React, { useState, useEffect, useCallback } from 'react';
import { SimpleHeader } from './components/SimpleHeader';
import { FrequencyScanner } from './components/FrequencyScanner';
import { FrequencyFixerCard } from './components/FrequencyFixerCard';
import { SimpleEQVisualizer } from './components/SimpleEQVisualizer';
import { MyFixesList } from './components/MyFixesList';
import { MusicAuditionCard } from './components/MusicAuditionCard';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { GitHubIcon } from './components/GitHubIcon';
import { AudioEngine, MusicState } from './audio/AudioEngine';
import { EQFix } from './types/audio';
import { useLanguage } from './context/LanguageContext';

const STORAGE_KEY = 'peq_fixes_v1';

export const App: React.FC = () => {
  const { t } = useLanguage();
  const engine = AudioEngine.getInstance();

  // Audio State
  const [isAudioRunning, setIsAudioRunning] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.25);
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(1000);
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);

  // Music Audition State
  const [musicState, setMusicState] = useState<MusicState>(() => engine.getMusicState());

  // User's EQ Fixes List (loaded from localStorage if present)
  const [fixes, setFixes] = useState<EQFix[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixes));
    } catch {}
  }, [fixes]);

  // Sync engine frequency & music callbacks
  useEffect(() => {
    engine.setFrequencyCallback((freq) => {
      setFrequency(freq);
    });
    engine.setMusicStateCallback((state) => {
      setMusicState(state);
    });
  }, [engine]);

  // Master Audio Toggle (Pure Tone)
  const handleToggleAudio = async () => {
    if (isAudioRunning) {
      engine.stop();
      setIsAudioRunning(false);
      setIsAutoScanning(false);
    } else {
      await engine.start();
      engine.rebuildFilterChain(fixes);
      setIsAudioRunning(true);
    }
  };

  // Music Player Handlers
  const handleUploadMusicFile = (file: File) => {
    engine.loadMusicFile(file);
  };

  const handleToggleMusicPlay = () => {
    if (isAudioRunning) {
      engine.stop();
      setIsAudioRunning(false);
      setIsAutoScanning(false);
    }
    engine.toggleMusic();
  };

  const handleSeekMusic = (sec: number) => {
    engine.seekMusic(sec);
  };

  const handleToggleMusicLoop = () => {
    engine.setMusicLoop(!musicState.isLooping);
  };

  // Frequency change
  const handleChangeFrequency = (newFreq: number) => {
    setFrequency(newFreq);
    engine.setFrequency(newFreq);
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    engine.setVolume(newVol);
  };

  // A/B Compare Toggle (Bypass)
  const handleToggleBypass = () => {
    const next = !isBypassed;
    setIsBypassed(next);
    engine.setBypass(next);
  };

  // Auto-Scan Walker
  const handleToggleAutoScan = (speed: 'slow' | 'normal' | 'fast' = 'normal') => {
    if (isAutoScanning && speed === 'normal') {
      engine.stopAutoScan();
      setIsAutoScanning(false);
    } else {
      engine.startAutoScan(speed);
      setIsAutoScanning(true);
      if (!isAudioRunning) {
        setIsAudioRunning(true);
      }
    }
  };

  // Save new fix
  const handleSaveFix = (newFixData: Omit<EQFix, 'id'>) => {
    const newFix: EQFix = {
      ...newFixData,
      id: `fix-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...fixes, newFix];
    setFixes(updated);
    engine.rebuildFilterChain(updated);
  };

  // Update existing fix live
  const handleUpdateFix = useCallback(
    (updatedFix: EQFix) => {
      const updated = fixes.map((f) => (f.id === updatedFix.id ? updatedFix : f));
      setFixes(updated);
      engine.updateLiveFix(updatedFix);
    },
    [fixes, engine]
  );

  // Remove fix
  const handleRemoveFix = (id: string) => {
    const updated = fixes.filter((f) => f.id !== id);
    setFixes(updated);
    engine.rebuildFilterChain(updated);
  };

  // Clear all fixes
  const handleClearAllFixes = () => {
    if (window.confirm(t.confirmClear)) {
      setFixes([]);
      engine.rebuildFilterChain([]);
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Header */}
      <SimpleHeader
        isAudioRunning={isAudioRunning}
        onToggleAudio={handleToggleAudio}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isBypassed={isBypassed}
        onToggleBypass={handleToggleBypass}
        fixesCount={fixes.length}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Frequency Scanner & On-The-Spot Fixer & Music Audition */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-5">
            {/* Step 1: Frequency Scanner */}
            <section>
              <FrequencyScanner
                frequency={frequency}
                onChangeFrequency={handleChangeFrequency}
                isAutoScanning={isAutoScanning}
                onToggleAutoScan={handleToggleAutoScan}
                isAudioRunning={isAudioRunning}
                onStartAudio={handleToggleAudio}
              />
            </section>

            {/* Step 2: Frequency Fixer (On The Spot Adjustment) */}
            <section>
              <FrequencyFixerCard
                currentFreq={frequency}
                fixes={fixes}
                onSaveFix={handleSaveFix}
                onUpdateFix={handleUpdateFix}
                onRemoveFix={handleRemoveFix}
                isAudioRunning={isAudioRunning}
                onStartAudio={handleToggleAudio}
              />
            </section>

            {/* Step 3: Audition on Your Music & A/B Compare */}
            <section>
              <MusicAuditionCard
                musicState={musicState}
                onUploadFile={handleUploadMusicFile}
                onTogglePlay={handleToggleMusicPlay}
                onSeek={handleSeekMusic}
                onToggleLoop={handleToggleMusicLoop}
                isBypassed={isBypassed}
                onToggleBypass={handleToggleBypass}
                fixesCount={fixes.length}
              />
            </section>
          </div>

          {/* Right Column: Visual Curve & My Fixes Overview (Sticky on Wide Screens) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-5 lg:sticky lg:top-4">
            {/* Step 3: Live EQ Response Curve */}
            <section>
              <SimpleEQVisualizer
                fixes={fixes}
                currentFreq={frequency}
                onSelectFrequency={handleChangeFrequency}
                isAudioRunning={isAudioRunning}
              />
            </section>

            {/* Step 4: Active Fixes Ledger */}
            <section>
              <MyFixesList
                fixes={fixes}
                onSelectFix={handleChangeFrequency}
                onRemoveFix={handleRemoveFix}
                onClearAll={handleClearAllFixes}
              />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-studio-border/60 py-3 px-6 bg-studio-surface/50 text-xs text-slate-500 font-mono">
        <div className="max-w-[1600px] mx-auto w-full flex flex-wrap justify-between items-center gap-2">
          <span>{t.footerText}</span>
          <a
            href="https://github.com/Silentishy/peq-tone-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            <span>{t.githubRepo}</span>
          </a>
        </div>
      </footer>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        fixes={fixes}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
