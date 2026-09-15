import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  ChevronDown,
  Check,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { EQProfile } from '../types/audio';
import { useLanguage } from '../context/LanguageContext';

interface ProfileSelectorProps {
  profiles: EQProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onRenameProfile: (id: string, newName: string) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
}) => {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCreateNew = () => {
    setIsOpen(false);
    const name = window.prompt(t.promptProfileName, lang === 'zh' ? '新耳机配置' : 'New Device Profile');
    if (name && name.trim()) {
      onCreateProfile(name.trim());
    }
  };

  const handleRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt(t.renameProfile, currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      onRenameProfile(id, newName.trim());
    }
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) return;
    if (window.confirm(lang === 'zh' ? `确定要删除配置 "${name}" 吗？` : `Delete profile "${name}"?`)) {
      onDeleteProfile(id);
    }
  };

  const getProfileDisplayName = (profile: EQProfile) => {
    if (lang === 'zh' && profile.nameZh) return profile.nameZh;
    return profile.name;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs transition active:scale-95 ${
          isOpen
            ? 'bg-studio-panel border-cyan-400 text-white ring-1 ring-cyan-400/40 shadow'
            : 'bg-studio-panel hover:bg-slate-700 text-slate-200 border-studio-border'
        }`}
        title={t.profileLabel}
      >
        <Headphones className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span className="font-bold max-w-[130px] truncate">
          {getProfileDisplayName(activeProfile)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-60 rounded-xl bg-studio-panel border border-studio-border shadow-2xl py-1.5 z-50 backdrop-blur-md">
          <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-studio-border/60 mb-1">
            {t.profileLabel}
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {profiles.map((profile) => {
              const isSelected = profile.id === activeProfileId;
              const displayName = getProfileDisplayName(profile);
              return (
                <div
                  key={profile.id}
                  onClick={() => {
                    onSelectProfile(profile.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                      : 'text-slate-300 hover:bg-studio-surface hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{displayName}</span>
                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                      ({profile.fixes.length})
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 hover:opacity-100">
                    <button
                      onClick={(e) => handleRename(profile.id, displayName, e)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-300"
                      title={t.renameProfile}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(profile.id, displayName, e)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400"
                        title={t.deleteProfile}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-studio-border/60 mt-1 pt-1">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-500/10 font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.addProfile}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
