import React, { useState, useEffect, useCallback } from 'react';
import { SimpleHeader } from './components/SimpleHeader';
import { WorkflowStepper } from './components/WorkflowStepper';
import { FrequencyScanner } from './components/FrequencyScanner';
import { FrequencyFixerCard } from './components/FrequencyFixerCard';
import { SimpleEQVisualizer } from './components/SimpleEQVisualizer';
import { MyFixesList } from './components/MyFixesList';
import { MusicAuditionCard } from './components/MusicAuditionCard';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { GitHubIcon } from './components/GitHubIcon';
import { AudioEngine, MusicState } from './audio/AudioEngine';
import { BenchmarkTrackId, EQFix, EQProfile, ToneMode } from './types/audio';
import { calculateHeadroom } from './utils/eqMath';
import { useLanguage } from './context/LanguageContext';

const PROFILES_STORAGE_KEY = 'peq_profiles_v2';
const ACTIVE_PROFILE_KEY = 'peq_active_profile_v2';

const DEFAULT_PROFILES: EQProfile[] = [
  { id: 'profile-default', name: 'Default Profile', nameZh: '默认设备配置', fixes: [], autoPreamp: true, preamp: 0 },
  { id: 'profile-iem', name: 'AirPods / In-Ear', nameZh: '入耳式 / AirPods', fixes: [], autoPreamp: true, preamp: 0 },
  { id: 'profile-overear', name: 'Over-Ear Headphones', nameZh: '头戴式大耳机', fixes: [], autoPreamp: true, preamp: 0 },
  { id: 'profile-speakers', name: 'Desktop Speakers', nameZh: '桌面音箱', fixes: [], autoPreamp: true, preamp: 0 },
];

export const App: React.FC = () => {
  const { t, lang } = useLanguage();
  const engine = AudioEngine.getInstance();

  // Audio Engine State
  const [isAudioRunning, setIsAudioRunning] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.25);
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(1000);
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);
  const [toneMode, setToneMode] = useState<ToneMode>('sine');
  const [isEqualLoudness, setIsEqualLoudness] = useState<boolean>(false);

  // Music Audition State
  const [musicState, setMusicState] = useState<MusicState>(() => engine.getMusicState());

  // Profiles State
  const [profiles, setProfiles] = useState<EQProfile[]>(() => {
    try {
      const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
      if (saved) return saved;
    } catch {}
    return DEFAULT_PROFILES[0].id;
  });

  // Current Active Profile
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const fixes = activeProfile.fixes;

  // Headroom & Preamp
  const { suggestedPreamp } = calculateHeadroom(fixes);
  const autoPreamp = activeProfile.autoPreamp ?? true;
  const effectivePreamp = autoPreamp ? suggestedPreamp : (activeProfile.preamp ?? 0);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Save Profiles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    } catch {}
  }, [profiles, activeProfileId]);

  // Sync Preamp to AudioEngine
  useEffect(() => {
    engine.setPreamp(effectivePreamp);
  }, [effectivePreamp, engine]);

  // Sync Engine callbacks
  useEffect(() => {
    engine.setFrequencyCallback((freq) => {
      setFrequency(freq);
    });
    engine.setMusicStateCallback((state) => {
      setMusicState(state);
    });
  }, [engine]);

  // Sync Filters to AudioEngine whenever active profile fixes change
  useEffect(() => {
    engine.rebuildFilterChain(fixes);
  }, [fixes, engine]);

  // Profile Management
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    const target = profiles.find((p) => p.id === id);
    if (target) {
      engine.rebuildFilterChain(target.fixes);
    }
  };

  const handleCreateProfile = (name: string) => {
    const newProfile: EQProfile = {
      id: `profile-${Date.now()}`,
      name,
      fixes: [],
      autoPreamp: true,
      preamp: 0,
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfileId(newProfile.id);
  };

  const handleRenameProfile = (id: string, newName: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName, nameZh: newName } : p))
    );
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (activeProfileId === id) {
      setActiveProfileId(remaining[0].id);
    }
  };

  const handleUpdatePreamp = (val: number, auto: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId ? { ...p, preamp: val, autoPreamp: auto } : p))
    );
  };

  const handleStepClick = (step: number) => {
    const targetMap: Record<number, string> = {
      1: 'step-1-scanner',
      2: 'step-2-fixer',
      3: 'step-3-audition',
      4: 'step-4-visualizer',
    };
    const targetId = targetMap[step];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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

  // Tone Mode & Equal-Loudness
  const handleSelectToneMode = (mode: ToneMode) => {
    setToneMode(mode);
    engine.setToneMode(mode);
  };

  const handleToggleEqualLoudness = () => {
    const next = !isEqualLoudness;
    setIsEqualLoudness(next);
    engine.setEqualLoudness(next);
  };

  // Music Player Handlers
  const handleUploadMusicFile = (file: File) => {
    engine.loadMusicFile(file);
  };

  const handleSelectBenchmarkTrack = (trackId: BenchmarkTrackId) => {
    engine.loadBenchmarkTrack(trackId);
    handleToggleMusicPlay();
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

  // Fixes Handlers (scoped to activeProfile)
  const updateActiveProfileFixes = (newFixes: EQFix[]) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId ? { ...p, fixes: newFixes } : p))
    );
  };

  const handleSaveFix = (newFixData: Omit<EQFix, 'id'>) => {
    const newFix: EQFix = {
      ...newFixData,
      id: `fix-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...fixes, newFix];
    updateActiveProfileFixes(updated);
  };

  const handleUpdateFix = useCallback(
    (updatedFix: EQFix) => {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === activeProfileId
            ? { ...p, fixes: p.fixes.map((f) => (f.id === updatedFix.id ? updatedFix : f)) }
            : p
        )
      );
      engine.updateLiveFix(updatedFix);
    },
    [activeProfileId, engine]
  );

  const handleRemoveFix = (id: string) => {
    const updated = fixes.filter((f) => f.id !== id);
    updateActiveProfileFixes(updated);
  };

  const handleClearAllFixes = () => {
    if (window.confirm(t.confirmClear)) {
      updateActiveProfileFixes([]);
    }
  };

  const handleImportFixes = (imported: Partial<EQFix>[], parsedPreamp?: number) => {
    const newFixes: EQFix[] = imported.map((item, idx) => ({
      id: `fix-import-${Date.now()}-${idx}`,
      frequency: item.frequency || 1000,
      gain: item.gain ?? 0,
      width: item.width || 'normal',
      q: item.q || 1.41,
      enabled: item.enabled ?? true,
      label: item.label,
    }));

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === activeProfileId) {
          return {
            ...p,
            fixes: newFixes,
            preamp: parsedPreamp !== undefined ? parsedPreamp : p.preamp,
            autoPreamp: parsedPreamp === undefined,
          };
        }
        return p;
      })
    );
  };

  // Keyboard Shortcuts Listener for Eyes-Closed Tuning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (musicState.isLoaded) {
          handleToggleMusicPlay();
        } else {
          handleToggleAudio();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 100 : 10;
        handleChangeFrequency(Math.max(20, Math.round(frequency - step)));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 100 : 10;
        handleChangeFrequency(Math.min(20000, Math.round(frequency + step)));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        // Adjust gain for existing fix at current frequency, or create one
        const existing = fixes.find((f) => Math.abs(f.frequency - frequency) / frequency < 0.035);
        if (existing) {
          handleUpdateFix({ ...existing, gain: Math.min(15, existing.gain + 0.5) });
        } else {
          handleSaveFix({ frequency, gain: 1.0, width: 'normal', q: 1.41, enabled: true });
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const existing = fixes.find((f) => Math.abs(f.frequency - frequency) / frequency < 0.035);
        if (existing) {
          handleUpdateFix({ ...existing, gain: Math.max(-15, existing.gain - 0.5) });
        } else {
          handleSaveFix({ frequency, gain: -1.0, width: 'normal', q: 1.41, enabled: true });
        }
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleToggleBypass();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleToggleAutoScan();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    musicState.isLoaded,
    isAudioRunning,
    frequency,
    fixes,
    isBypassed,
    isAutoScanning,
    handleUpdateFix,
  ]);

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
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onRenameProfile={handleRenameProfile}
        onDeleteProfile={handleDeleteProfile}
        effectivePreamp={effectivePreamp}
      />

      {/* Main Container */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-4 sm:gap-5">
        {/* Guided 4-Step Tuning Workflow Navigation Banner */}
        <WorkflowStepper onStepClick={handleStepClick} />

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
                toneMode={toneMode}
                onSelectToneMode={handleSelectToneMode}
                isEqualLoudness={isEqualLoudness}
                onToggleEqualLoudness={handleToggleEqualLoudness}
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
                onSelectFrequency={handleChangeFrequency}
                isAudioRunning={isAudioRunning}
                onStartAudio={handleToggleAudio}
              />
            </section>

            {/* Step 3: Audition on Your Music & A/B Compare */}
            <section>
              <MusicAuditionCard
                musicState={musicState}
                onUploadFile={handleUploadMusicFile}
                onSelectBenchmarkTrack={handleSelectBenchmarkTrack}
                onTogglePlay={handleToggleMusicPlay}
                onSeek={handleSeekMusic}
                onToggleLoop={handleToggleMusicLoop}
                isBypassed={isBypassed}
                onToggleBypass={handleToggleBypass}
                fixesCount={fixes.length}
              />
            </section>
          </div>

          {/* Right Column: Visual Curve & My Fixes Overview (Sticky on Wide Screens with Overflow Protection) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:scrollbar-thin lg:pr-1">
            {/* Step 4: Live EQ Response Curve with Draggable Nodes */}
            <section>
              <SimpleEQVisualizer
                fixes={fixes}
                currentFreq={frequency}
                onSelectFrequency={handleChangeFrequency}
                onUpdateFix={handleUpdateFix}
                isAudioRunning={isAudioRunning}
              />
            </section>

            {/* Step 5: Active Fixes Ledger */}
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
        preamp={activeProfile.preamp ?? 0}
        autoPreamp={autoPreamp}
        onUpdatePreamp={handleUpdatePreamp}
        onImportFixes={handleImportFixes}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
