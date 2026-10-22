import React, { useEffect, useState } from 'react';
import { GitaVerse } from '../../content/gita/gitaTypes';
import { VERIFIED_GITA_VERSES } from '../../content/gita/gitaRepository';
import { audioService } from '../../services/audio/audioService';
import { coinService } from '../../services/coins/coinService';
import { Sparkles, FastForward, CheckCircle2, BookOpen, Coins } from 'lucide-react';

export interface KrishnaVictoryModalProps {
  isOpen: boolean;
  matchId: string;
  winnerName: string;
  onClose: () => void;
  onPlayAgain: () => void;
}

export const KrishnaVictoryModal: React.FC<KrishnaVictoryModalProps> = ({
  isOpen,
  matchId,
  winnerName,
  onClose,
  onPlayAgain,
}) => {
  const [verse, setVerse] = useState<GitaVerse>(VERIFIED_GITA_VERSES[0]);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [coinsAwarded, setCoinsAwarded] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setRewardClaimed(false);
      return;
    }

    // Pick a verified verse from the supplied Gita Press repository
    const selected = VERIFIED_GITA_VERSES[Math.floor(Math.random() * VERIFIED_GITA_VERSES.length)];
    setVerse(selected);

    // Play uplifting divine music
    audioService.playBgm('krishna_victory');
    audioService.playSfx('win_bell');

    // Claim victory coins idempotently (prevents duplicate rewards)
    const result = coinService.awardVictory(matchId, 50);
    if (result.success) {
      setCoinsAwarded(result.reward);
      setRewardClaimed(true);
      audioService.playSfx('coin_reward');
    }

    return () => {
      audioService.stopBgm();
    };
  }, [isOpen, matchId]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Divine Victory of Destiny"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#14233a] via-[#0b1424] to-[#060a12] border-2 border-[#ffd700] shadow-[0_0_60px_rgba(212,175,55,0.4)] p-5 sm:p-7 text-[#e8ded1] text-center my-auto">
        {/* Skip / Close Top Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-xs font-cinzel text-[#ffd700] border border-[#d4af37]/40 cursor-pointer transition-colors"
        >
          <span>Continue</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>

        {/* Ambient Divine Radiance Aura */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-radial from-[#38bdf8]/20 via-[#ffd700]/15 to-transparent blur-3xl pointer-events-none" />

        {/* Respectful Lord Krishna Illustration */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-3 flex items-center justify-center">
          {/* Radiant Halo (Prabhavali) */}
          <div className="absolute inset-0 rounded-full border-2 border-[#ffd700]/80 animate-spin [animation-duration:30s] border-dashed" />
          <div className="absolute inset-2 rounded-full bg-radial from-[#fff4b8] via-[#ffd700]/40 to-transparent blur-md pointer-events-none" />

          {/* Sacred Illustration of Lord Krishna with Peacock Feather & Flute */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-2 border-[#ffd700] flex items-center justify-center shadow-2xl">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full object-cover"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="krishnaSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="60%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="krishnaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff3b0" />
                  <stop offset="50%" stopColor="#ffd700" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>

              {/* Radiant Sunburst behind Head */}
              <circle cx="100" cy="90" r="65" fill="#fef08a" opacity="0.3" />

              {/* Shoulders & Pitambara (Yellow Silk Robe) */}
              <path
                d="M 40,185 Q 100,140 160,185 L 165,200 L 35,200 Z"
                fill="url(#krishnaGold)"
                stroke="#d97706"
                strokeWidth="1.5"
              />

              {/* Beautiful Pearl & Gem Garland (Vanamala) */}
              <path
                d="M 60,175 Q 100,205 140,175"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeDasharray="4 2"
              />

              {/* Neck & Graceful Face */}
              <rect x="92" y="125" width="16" height="20" fill="#38bdf8" />
              <ellipse cx="100" cy="98" rx="28" ry="34" fill="url(#krishnaSkin)" />

              {/* Serene Half-Smiling Lips */}
              <path
                d="M 92,116 Q 100,123 108,116"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Lotus Eyes (Kamalanayana) */}
              <path
                d="M 80,94 Q 89,89 94,94 Q 89,98 80,94"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1"
              />
              <circle cx="88" cy="94" r="2.5" fill="#0f172a" />

              <path
                d="M 106,94 Q 111,89 120,94 Q 111,98 106,94"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1"
              />
              <circle cx="112" cy="94" r="2.5" fill="#0f172a" />

              {/* Sacred Sandalwood Tilak */}
              <path
                d="M 98,78 L 98,90 L 102,90 L 102,78 Z"
                fill="#ffffff"
              />
              <circle cx="100" cy="92" r="1.5" fill="#e11d48" />

              {/* Royal Golden Mukuta (Crown) */}
              <path
                d="M 72,75 L 100,35 L 128,75 Q 100,68 72,75 Z"
                fill="url(#krishnaGold)"
                stroke="#78350f"
                strokeWidth="1.5"
              />
              <circle cx="100" cy="52" r="4" fill="#dc2626" />

              {/* Sacred Peacock Feather (Mayurapankha) */}
              <g transform="translate(100, 32)">
                <ellipse cx="0" cy="-14" rx="10" ry="16" fill="#059669" />
                <ellipse cx="0" cy="-14" rx="6" ry="11" fill="#2563eb" />
                <circle cx="0" cy="-14" r="3.5" fill="#ffd700" />
                <line x1="0" y1="0" x2="0" y2="-5" stroke="#78350f" strokeWidth="2" />
              </g>

              {/* Divine Golden Bamboo Flute (Murali) */}
              <g transform="rotate(-18 100 135)">
                <rect x="50" y="132" width="100" height="7" rx="3.5" fill="url(#krishnaGold)" stroke="#78350f" strokeWidth="1" />
                <circle cx="65" cy="135.5" r="1.5" fill="#3b200b" />
                <circle cx="75" cy="135.5" r="1.5" fill="#3b200b" />
                <circle cx="85" cy="135.5" r="1.5" fill="#3b200b" />
                <circle cx="95" cy="135.5" r="1.5" fill="#3b200b" />
                <circle cx="105" cy="135.5" r="1.5" fill="#3b200b" />
              </g>
            </svg>
          </div>
        </div>

        {/* Victory Header */}
        <span className="text-[11px] font-cinzel tracking-widest text-[#ffd700] uppercase font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
          Victory of Righteousness
        </span>
        <h2 className="text-xl sm:text-2xl font-cinzel font-black text-white mt-0.5">
          {winnerName} Triumphs!
        </h2>

        {/* Coin Award Notification */}
        {rewardClaimed && (
          <div className="my-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/50 text-xs font-cinzel text-[#ffd700]">
            <Coins className="w-4 h-4 animate-bounce" />
            <span>+{coinsAwarded} Sacred Coins added to your Treasury!</span>
          </div>
        )}

        {/* Verified Bhagavad Gita Verse Card */}
        <div className="mt-2 text-left p-4 rounded-2xl bg-[#091120] border border-[#d4af37]/40 shadow-inner space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-[#f5ecd8]">
              <BookOpen className="w-4 h-4 text-[#ffd700]" />
              <span>Chapter {verse.chapter}, Verse {verse.verse}</span>
            </div>
            <span className="text-[10px] text-[#c8b69b]/80 italic">Gita Press</span>
          </div>

          {/* Sanskrit Text */}
          <p className="text-xs sm:text-sm font-cinzel font-bold text-[#ffd700] whitespace-pre-line text-center leading-relaxed">
            {verse.sanskritText}
          </p>

          {/* English Translation */}
          <div className="text-xs text-[#e8ded1] leading-relaxed pt-1 border-t border-[#d4af37]/15">
            <strong className="text-[#38bdf8] block text-[11px] uppercase tracking-wider font-cinzel mb-0.5">
              Translation:
            </strong>
            <p className="italic">"{verse.englishTranslation}"</p>
          </div>

          {/* Philosophical & Life Guidance Meaning */}
          <div className="text-xs text-[#c8b69b] leading-relaxed pt-1">
            <strong className="text-[#86efac] block text-[11px] uppercase tracking-wider font-cinzel mb-0.5">
              Inner Wisdom:
            </strong>
            <p>{verse.spiritualMeaning}</p>
          </div>
        </div>

        {/* Attribution Badge */}
        <p className="text-[10px] text-[#c8b69b]/70 italic mt-2.5">
          {verse.attribution}
        </p>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-[#d4af37]/25 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-transform cursor-pointer shadow-lg"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-[#d4af37]/50 text-[#c8b69b] hover:text-white font-cinzel text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Return to Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
