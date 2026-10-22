import React, { useState, useEffect } from 'react';
import { audioService, AudioSettings } from '../../services/audio/audioService';
import { languageService } from '../../services/i18n/languageService';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../../services/i18n/translations';
import { Volume2, VolumeX, Music, Sliders, X, Globe2 } from 'lucide-react';

export interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => audioService.getSettings());
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => languageService.getLanguage());

  useEffect(() => {
    const unsubAudio = audioService.subscribe((s) => setSettings(s));
    const unsubLang = languageService.subscribe((l) => setCurrentLang(l));
    return () => {
      unsubAudio();
      unsubLang();
    };
  }, []);

  if (!isOpen) return null;

  const handleLangChange = (code: SupportedLanguage) => {
    languageService.setLanguage(code);
    setCurrentLang(code);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c140d] via-[#120d08] to-[#080503] border border-[#d4af37]/60 shadow-2xl p-5 sm:p-6 text-[#e8ded1]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#ffd700]" />
            <h3 id="audio-settings-title" className="text-base sm:text-lg font-cinzel font-bold text-[#f5ecd8]">
              Audio & Preferences
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Mute Toggle */}
        <div className="mt-4 p-3 rounded-2xl bg-[#090604] border border-[#d4af37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-cinzel font-semibold text-white">
            {settings.masterMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Master Audio</span>
          </div>
          <button
            type="button"
            onClick={() => audioService.toggleMasterMute()}
            className={`min-h-[36px] px-4 py-1 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              settings.masterMuted ? 'bg-red-950 text-red-200 border border-red-500' : 'bg-emerald-950 text-emerald-200 border border-emerald-500'
            }`}
          >
            {settings.masterMuted ? 'Muted' : 'Active'}
          </button>
        </div>

        {/* BGM Volume Slider */}
        <div className="mt-4 space-y-1.5 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[#c8b69b] font-medium flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#ffd700]" />
              Background Music (BGM)
            </span>
            <span className="font-mono text-[#ffd700] tabular-nums">
              {settings.bgmMuted ? '0%' : `${Math.round(settings.bgmVolume * 100)}%`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmMuted ? 0 : settings.bgmVolume}
              onChange={(e) => {
                if (settings.bgmMuted) audioService.toggleBgmMute();
                audioService.setBgmVolume(parseFloat(e.target.value));
              }}
              className="flex-1 accent-[#ffd700] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => audioService.toggleBgmMute()}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#1b253b] text-[#c8b69b] hover:text-white cursor-pointer"
            >
              {settings.bgmMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* SFX Volume Slider */}
        <div className="mt-4 space-y-1.5 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[#c8b69b] font-medium flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#38bdf8]" />
              Sound Effects (SFX)
            </span>
            <span className="font-mono text-[#38bdf8] tabular-nums">
              {settings.sfxMuted ? '0%' : `${Math.round(settings.sfxVolume * 100)}%`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxMuted ? 0 : settings.sfxVolume}
              onChange={(e) => {
                if (settings.sfxMuted) audioService.toggleSfxMute();
                audioService.setSfxVolume(parseFloat(e.target.value));
              }}
              className="flex-1 accent-[#38bdf8] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => audioService.toggleSfxMute()}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#1b253b] text-[#c8b69b] hover:text-white cursor-pointer"
            >
              {settings.sfxMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mt-5 pt-3 border-t border-[#d4af37]/20 text-left">
          <span className="text-xs text-[#c8b69b] font-cinzel font-medium flex items-center gap-1.5 mb-2">
            <Globe2 className="w-4 h-4 text-[#ffd700]" />
            Select Language (ଭାଷା / भाषा)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLangChange(lang.code)}
                className={`min-h-[38px] p-1.5 rounded-xl text-center text-xs transition-all cursor-pointer flex flex-col items-center justify-center ${
                  currentLang === lang.code
                    ? 'bg-[#d4af37] text-[#1c1510] font-bold shadow-md'
                    : 'bg-[#140e08] text-[#c8b69b] hover:bg-[#1f150d] border border-[#d4af37]/20'
                }`}
              >
                <span className="font-semibold">{lang.nativeName}</span>
                <span className="text-[10px] opacity-75">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#d4af37]/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wide cursor-pointer shadow-md"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
