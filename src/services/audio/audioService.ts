/**
 * Comprehensive Audio Service for Ludo: The Game of Destiny.
 * Separates Background Music (BGM) and Sound Effects (SFX) with volume and mute controls.
 * Features replaceable audio assets with robust, graceful fallbacks to synthesized Web Audio
 * so that missing or unplayable audio files never break the application.
 */

export type BgmTrack = 'home' | 'gameplay' | 'krishna_victory' | 'shakuni_scene';
export type SfxEffect =
  | 'dice'
  | 'movement'
  | 'capture'
  | 'shakuni_laugh'
  | 'coin_drop'
  | 'coin_reward'
  | 'win_bell'
  | 'quiz_correct'
  | 'quiz_incorrect';

export interface AudioSettings {
  bgmMuted: boolean;
  bgmVolume: number; // 0.0 to 1.0
  sfxMuted: boolean;
  sfxVolume: number; // 0.0 to 1.0
  masterMuted: boolean;
}

const SETTINGS_KEY = 'ludo_audio_settings_v1';

import { getAssetUrl } from '../../utils/assets';

class AudioService {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings;
  private currentBgmTrack: BgmTrack | null = null;
  private bgmAudioEl: HTMLAudioElement | null = null;
  private bgmSynthInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(settings: AudioSettings) => void> = new Set();

  // Replaceable audio asset URLs (can point to local files or remote tracks)
  private bgmAssetMap: Record<BgmTrack, string> = {
    home: getAssetUrl('assets/audio/bgm_home.mp3'),
    gameplay: getAssetUrl('assets/audio/bgm_gameplay.mp3'),
    krishna_victory: getAssetUrl('assets/audio/bgm_krishna.mp3'),
    shakuni_scene: getAssetUrl('assets/audio/bgm_shakuni.mp3'),
  };

  private sfxAssetMap: Record<SfxEffect, string> = {
    dice: getAssetUrl('assets/audio/sfx_dice.mp3'),
    movement: getAssetUrl('assets/audio/sfx_step.mp3'),
    capture: getAssetUrl('assets/audio/sfx_capture.mp3'),
    shakuni_laugh: getAssetUrl('assets/audio/sfx_shakuni_laugh.mp3'),
    coin_drop: getAssetUrl('assets/audio/sfx_coin_drop.mp3'),
    coin_reward: getAssetUrl('assets/audio/sfx_coin_reward.mp3'),
    win_bell: getAssetUrl('assets/audio/sfx_win_bell.mp3'),
    quiz_correct: getAssetUrl('assets/audio/sfx_quiz_correct.mp3'),
    quiz_incorrect: getAssetUrl('assets/audio/sfx_quiz_incorrect.mp3'),
  };

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): AudioSettings {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            bgmMuted: Boolean(parsed.bgmMuted),
            bgmVolume: typeof parsed.bgmVolume === 'number' ? parsed.bgmVolume : 0.6,
            sfxMuted: Boolean(parsed.sfxMuted),
            sfxVolume: typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : 0.8,
            masterMuted: Boolean(parsed.masterMuted),
          };
        }
      } catch (err) {
        console.error('Failed to load audio settings:', err);
      }
    }
    return {
      bgmMuted: false,
      bgmVolume: 0.6,
      sfxMuted: false,
      sfxVolume: 0.8,
      masterMuted: false,
    };
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    }
    this.listeners.forEach((fn) => fn({ ...this.settings }));
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public subscribe(listener: (settings: AudioSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /* ------------------- BGM CONTROLS ------------------- */

  public playBgm(track: BgmTrack) {
    if (this.currentBgmTrack === track && this.bgmAudioEl && !this.bgmAudioEl.paused) {
      return;
    }
    this.stopBgm();
    this.currentBgmTrack = track;

    if (this.settings.masterMuted || this.settings.bgmMuted) {
      return;
    }

    if (typeof window !== 'undefined') {
      // Use synthesized ambient audio directly for zero-latency, zero-404 performance
      this.startSynthBgm(track);
    }
  }

  public stopBgm() {
    if (this.bgmAudioEl) {
      try {
        this.bgmAudioEl.pause();
        this.bgmAudioEl.currentTime = 0;
      } catch {
        // ignore
      }
      this.bgmAudioEl = null;
    }
    if (this.bgmSynthInterval) {
      clearInterval(this.bgmSynthInterval);
      this.bgmSynthInterval = null;
    }
    this.currentBgmTrack = null;
  }

  public setBgmVolume(volume: number) {
    this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudioEl) {
      this.bgmAudioEl.volume = this.settings.bgmVolume;
    }
    this.saveSettings();
  }

  public toggleBgmMute(): boolean {
    this.settings.bgmMuted = !this.settings.bgmMuted;
    if (this.settings.bgmMuted) {
      this.stopBgm();
    } else if (this.currentBgmTrack) {
      this.playBgm(this.currentBgmTrack);
    }
    this.saveSettings();
    return this.settings.bgmMuted;
  }

  /* ------------------- SFX CONTROLS ------------------- */

  public playSfx(effect: SfxEffect) {
    if (this.settings.masterMuted || this.settings.sfxMuted) {
      return;
    }

    // Direct synthesized Web Audio eliminates all network latency and 404 error delays
    this.synthesizeSfx(effect);
  }

  public setSfxVolume(volume: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public toggleSfxMute(): boolean {
    this.settings.sfxMuted = !this.settings.sfxMuted;
    this.saveSettings();
    return this.settings.sfxMuted;
  }

  public toggleMasterMute(): boolean {
    this.settings.masterMuted = !this.settings.masterMuted;
    if (this.settings.masterMuted) {
      this.stopBgm();
    } else if (this.currentBgmTrack) {
      this.playBgm(this.currentBgmTrack);
    }
    this.saveSettings();
    return this.settings.masterMuted;
  }

  public toggleMute(): boolean {
    return this.toggleMasterMute();
  }

  /* ------------------- SYNTHESIZED WEB AUDIO FALLBACKS ------------------- */

  private startSynthBgm(track: BgmTrack) {
    if (this.bgmSynthInterval) {
      clearInterval(this.bgmSynthInterval);
    }
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Define harmonic modal chords based on scene
    const chordFrequencies =
      track === 'krishna_victory'
        ? [432, 540, 648, 864] // Divine peaceful harmonics (A4=432Hz)
        : track === 'shakuni_scene'
        ? [220, 261.63, 311.13, 440] // Diminished/minor mischievous chord
        : track === 'gameplay'
        ? [293.66, 369.99, 440, 587.33] // Energetic D major / Raga Bilawal
        : [261.63, 329.63, 392.0, 523.25]; // C major temple tambura drone

    let step = 0;
    const playChord = () => {
      if (this.settings.masterMuted || this.settings.bgmMuted) return;
      const now = ctx.currentTime;
      const freq = chordFrequencies[step % chordFrequencies.length];
      step++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = track === 'krishna_victory' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.015 * this.settings.bgmVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 4);
    };

    playChord();
    this.bgmSynthInterval = setInterval(playChord, 3500);
  }

  private synthesizeSfx(effect: SfxEffect) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const vol = this.settings.sfxVolume;
    const now = ctx.currentTime;

    switch (effect) {
      case 'dice': {
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const delay = i * 0.04;
          osc.frequency.setValueAtTime(220 + Math.random() * 120, now + delay);
          osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.05);

          gain.gain.setValueAtTime(0.12 * vol, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.07);
        }
        break;
      }
      case 'movement': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

        gain.gain.setValueAtTime(0.12 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
      case 'capture': {
        [330, 415, 495, 660].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          gain.gain.setValueAtTime(0.14 * vol, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + 0.4);
        });
        break;
      }
      case 'shakuni_laugh': {
        // Mischievous staccato chuckle pitches
        [380, 340, 420, 330, 400, 310].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const t = now + idx * 0.11;
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.08);

          gain.gain.setValueAtTime(0.1 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.1);
        });
        break;
      }
      case 'coin_drop':
      case 'coin_reward': {
        [987.77, 1318.51, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.06;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.15 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.3);
        });
        break;
      }
      case 'quiz_correct': {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t = now + idx * 0.05;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.12 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }
      case 'quiz_incorrect': {
        [220, 207.65].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const t = now + idx * 0.12;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.12 * vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
        break;
      }
      case 'win_bell': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(860, now + 0.7);

        gain.gain.setValueAtTime(0.2 * vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }
    }
  }
}

export const audioService = new AudioService();
