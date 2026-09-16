import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimpleHeader } from './components/SimpleHeader';
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
import { calculateHeadroom, QMarkState, calculateQFromMarks, formatFreq } from './utils/eqMath';
import { useLanguage } from './context/LanguageContext';

const PROFILES_STORAGE_KEY = 'peq_profiles_v2';
const ACTIVE_PROFILE_KEY = 'peq_active_profile_v2';
const SESSION_STORAGE_KEY = 'peq_session_v1';

const DEFAULT_PROFILES: EQProfile[] = [
  { id: 'profile-default', name: 'Default Profile', nameZh: '默认设备配置', fixes: [], autoPreamp: true, preamp: 0 },
  { id: 'profile-iem', name: 'AirPods / In-Ear', nameZh: '入耳式 / AirPods', fixes: [], autoPreamp: true, preamp: 0 },
  { id: 'profile-overear', name: 'Over-Ear Headphones', nameZh: '头戴式大耳机', fixes: [], autoPreamp: true, preamp: 0 },
  { id: 'profile-speakers', name: 'Desktop Speakers', nameZh: '桌面音箱', fixes: [], autoPreamp: true, preamp: 0 },
];

export const App: React.FC = () => {
  const { t, lang } = useLanguage();
  const engine = AudioEngine.getInstance();

  // Audio Engine State - initialized from persisted session settings with safe fallbacks
  const [isAudioRunning, setIsAudioRunning] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1) {
          return parsed.volume;
        }
      }
    } catch {}
    return 0.25;
  });
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.frequency === 'number' && parsed.frequency >= 20 && parsed.frequency <= 20000) {
          return parsed.frequency;
        }
      }
    } catch {}
    return 1000;
  });
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);
  const [toneMode, setToneMode] = useState<ToneMode>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.toneMode === 'sine' || parsed.toneMode === 'narrow_noise') {
          return parsed.toneMode;
        }
      }
    } catch {}
    return 'sine';
  });
  const [isEqualLoudness, setIsEqualLoudness] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.isEqualLoudness === 'boolean') {
          return parsed.isEqualLoudness;
        }
      }
    } catch {}
    return false;
  });

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

  // Undo & Redo History (snapshots of the active profile's fixes & preamp)
  interface UndoSnapshot {
    fixes: EQFix[];
    preamp?: number;
    autoPreamp?: boolean;
  }
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<UndoSnapshot[]>([]);
  const lastUndoPushRef = useRef<number>(0);
  const UNDO_COALESCE_MS = 700;
  const UNDO_MAX_DEPTH = 50;

  // Ephemeral Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  // 3-Point Q Measurement State (eqbyear method)
  const [qMarks, setQMarks] = useState<QMarkState>({});
  const [suggestedQ, setSuggestedQ] = useState<number | null>(null);
  const frequencyRef = useRef<number>(frequency);
  useEffect(() => {
    frequencyRef.current = frequency;
  }, [frequency]);

  const markedCount = (qMarks.start != null ? 1 : 0) + (qMarks.top != null ? 1 : 0) + (qMarks.end != null ? 1 : 0);
  const is3PointInProgress = markedCount > 0 && markedCount < 3;

  const handleSetQMark = useCallback(
    (which: 'start' | 'top' | 'end', freqOverride?: number) => {
      const f = freqOverride ?? frequencyRef.current;
      setQMarks((prev) => {
        const next = { ...prev, [which]: f };
        const freqLabel = formatFreq(f);
        if (which === 'start') showToast(`${t.toastMarkedStart} ${freqLabel}`);
        else if (which === 'top') showToast(`${t.toastMarkedTop} ${freqLabel}`);
        else if (which === 'end') showToast(`${t.toastMarkedEnd} ${freqLabel}`);
        return next;
      });
    },
    [showToast, t]
  );

  const handleClearQMarks = useCallback(() => {
    setQMarks({});
    setSuggestedQ(null);
  }, []);

  // When all 3 marks are filled, automatically calculate Q and fc, sync to Step 2, and unlock Step 2
  useEffect(() => {
    if (qMarks.start != null && qMarks.top != null && qMarks.end != null) {
      const res = calculateQFromMarks(qMarks);
      if (res) {
        handleChangeFrequency(res.fc);
        setSuggestedQ(res.q);
        showToast(`${t.qFinderReady} ${res.q.toFixed(2)}`);
        const fixerEl = document.getElementById('step-2-fixer');
        if (fixerEl) {
          fixerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          fixerEl.classList.add('ring-2', 'ring-cyan-400');
          setTimeout(() => {
            fixerEl.classList.remove('ring-2', 'ring-cyan-400');
          }, 1500);
        }
      }
    }
  }, [qMarks, showToast, t]);

  // Save Profiles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    } catch {}
  }, [profiles, activeProfileId]);

  // Save Session Settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ volume, frequency, toneMode, isEqualLoudness })
      );
    } catch {}
  }, [volume, frequency, toneMode, isEqualLoudness]);

  // Sync Initial AudioEngine Settings on Mount
  useEffect(() => {
    engine.setVolume(volume);
    engine.setFrequency(frequency);
    engine.setToneMode(toneMode);
    engine.setEqualLoudness(isEqualLoudness);
  }, [engine]);

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
    if (id === activeProfileId) return;
    setActiveProfileId(id);
    setUndoStack([]);
    setRedoStack([]);
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
    setUndoStack([]);
    setRedoStack([]);
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
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  const handleUpdatePreamp = (val: number, auto: boolean) => {
    pushUndoSnapshot(false);
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId ? { ...p, preamp: val, autoPreamp: auto } : p))
    );
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

  const handleRemoveMusic = () => {
    engine.removeMusic();
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
  // Captures the current fixes & preamp so the next change can be undone.
  // force=false coalesces rapid consecutive updates (slider scrubs, node
  // dragging) into a single undo step.
  const pushUndoSnapshot = useCallback(
    (force = false) => {
      setRedoStack([]); // Any new change clears redo history
      const now = Date.now();
      if (!force && now - lastUndoPushRef.current < UNDO_COALESCE_MS) {
        lastUndoPushRef.current = now;
        return;
      }
      lastUndoPushRef.current = now;
      setUndoStack((prev) => {
        const next = [
          ...prev,
          { fixes, preamp: activeProfile.preamp, autoPreamp: activeProfile.autoPreamp },
        ];
        return next.length > UNDO_MAX_DEPTH ? next.slice(next.length - UNDO_MAX_DEPTH) : next;
      });
    },
    [fixes, activeProfile]
  );

  const updateActiveProfileFixes = (newFixes: EQFix[]) => {
    pushUndoSnapshot(true);
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
    setQMarks({});
    setSuggestedQ(null);
  };

  const handleUpdateFix = useCallback(
    (updatedFix: EQFix) => {
      pushUndoSnapshot(false);
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === activeProfileId
            ? { ...p, fixes: p.fixes.map((f) => (f.id === updatedFix.id ? updatedFix : f)) }
            : p
        )
      );
      engine.updateLiveFix(updatedFix);
      setQMarks((prev) => {
        if (prev.start != null || prev.top != null || prev.end != null) {
          return {};
        }
        return prev;
      });
      setSuggestedQ(null);
    },
    [activeProfileId, engine, pushUndoSnapshot]
  );

  const handleRemoveFix = (id: string) => {
    const updated = fixes.filter((f) => f.id !== id);
    updateActiveProfileFixes(updated);
  };

  const handleSelectFixFromLedger = (freq: number) => {
    handleChangeFrequency(freq);
    const fixerEl = document.getElementById('step-2-fixer');
    if (fixerEl) {
      fixerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fixerEl.classList.add('ring-2', 'ring-cyan-400');
      setTimeout(() => {
        fixerEl.classList.remove('ring-2', 'ring-cyan-400');
      }, 1500);
    }
  };

  const handleClearAllFixes = () => {
    if (window.confirm(t.confirmClear)) {
      updateActiveProfileFixes([]);
    }
  };

  const handleImportFixes = (imported: Partial<EQFix>[], parsedPreamp?: number) => {
    pushUndoSnapshot(true);
    const newFixes: EQFix[] = imported.map((item, idx) => {
      const filterType = item.filterType || 'peaking';
      const defaultQ = filterType === 'lowshelf' ? 0.71 : 1.41;
      return {
        id: `fix-import-${Date.now()}-${idx}`,
        frequency: item.frequency || 1000,
        gain: item.gain ?? 0,
        width: item.width || 'normal',
        q: item.q || defaultQ,
        filterType,
        enabled: item.enabled ?? true,
        label: item.label || (filterType === 'lowshelf' ? 'Bass Shelf' : undefined),
      };
    });

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

  // Undo: restore the most recent snapshot of the active profile's fixes & preamp
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [
      ...prev,
      { fixes, preamp: activeProfile.preamp, autoPreamp: activeProfile.autoPreamp },
    ]);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfileId
          ? { ...p, fixes: last.fixes, preamp: last.preamp, autoPreamp: last.autoPreamp }
          : p
      )
    );
    setUndoStack((prev) => prev.slice(0, -1));
    lastUndoPushRef.current = 0;
    showToast(t.toastUndo);
  }, [undoStack, activeProfileId, fixes, activeProfile, showToast, t]);

  // Redo: reapply the most recently undone snapshot
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [
      ...prev,
      { fixes, preamp: activeProfile.preamp, autoPreamp: activeProfile.autoPreamp },
    ]);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfileId
          ? { ...p, fixes: next.fixes, preamp: next.preamp, autoPreamp: next.autoPreamp }
          : p
      )
    );
    setRedoStack((prev) => prev.slice(0, -1));
    lastUndoPushRef.current = 0;
    showToast(t.toastRedo);
  }, [redoStack, activeProfileId, fixes, activeProfile, showToast, t]);

  // Keyboard Shortcuts Listener for Eyes-Closed Tuning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if ((isMod && e.shiftKey && (e.key === 'z' || e.key === 'Z')) || (e.ctrlKey && (e.key === 'y' || e.key === 'Y'))) {
        e.preventDefault();
        handleRedo();
      } else if (isMod && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === '1') {
        e.preventDefault();
        handleSetQMark('start');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSetQMark('top');
      } else if (e.key === '3') {
        e.preventDefault();
        handleSetQMark('end');
      } else if (e.key === 'Escape') {
        if (qMarks.start != null || qMarks.top != null || qMarks.end != null) {
          e.preventDefault();
          handleClearQMarks();
        }
      } else if (e.code === 'Space') {
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
    handleUndo,
    handleRedo,
    qMarks,
    handleSetQMark,
    handleClearQMarks,
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
        canUndo={undoStack.length > 0}
        onUndo={handleUndo}
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
                toneMode={toneMode}
                onSelectToneMode={handleSelectToneMode}
                isEqualLoudness={isEqualLoudness}
                onToggleEqualLoudness={handleToggleEqualLoudness}
                qMarks={qMarks}
                onSetMark={handleSetQMark}
                onClearMarks={handleClearQMarks}
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
                suggestedQ={suggestedQ}
                isLocked={is3PointInProgress}
                markedCount={markedCount}
                onClearMarks={handleClearQMarks}
              />
            </section>

            {/* Step 3: Audition on Your Music & A/B Compare */}
            <section>
              <MusicAuditionCard
                musicState={musicState}
                onUploadFile={handleUploadMusicFile}
                onRemoveMusic={handleRemoveMusic}
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
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-5 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:scrollbar-thin lg:pr-1">
            {/* Step 4: Live EQ Response Curve with Draggable Nodes */}
            <section>
              <SimpleEQVisualizer
                fixes={fixes}
                currentFreq={frequency}
                onSelectFrequency={handleChangeFrequency}
                onUpdateFix={handleUpdateFix}
                isAudioRunning={isAudioRunning}
                effectivePreamp={effectivePreamp}
                isBypassed={isBypassed}
                qMarks={qMarks}
              />
            </section>

            {/* Step 5: Active Fixes Ledger */}
            <section>
              <MyFixesList
                fixes={fixes}
                currentFreq={frequency}
                onSelectFix={handleSelectFixFromLedger}
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

      {/* Floating Ephemeral Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all animate-bounce-short">
          <div className="bg-studio-panel/95 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-medium px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
