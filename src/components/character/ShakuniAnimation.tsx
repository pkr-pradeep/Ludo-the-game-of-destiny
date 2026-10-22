import React, { useEffect, useState } from 'react';
import { audioService } from '../../services/audio/audioService';
import { FastForward, Coins } from 'lucide-react';

export interface ShakuniAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const ShakuniAnimation: React.FC<ShakuniAnimationProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [frame, setFrame] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setFrame(0);
      return;
    }

    // Play Shakuni's mischievous laugh and background music
    audioService.playBgm('shakuni_scene');
    audioService.playSfx('shakuni_laugh');

    const interval = setInterval(() => {
      setFrame((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setTimeout(onComplete, 1200);
          return 6;
        }
        return prev + 1;
      });
    }, 600);

    return () => {
      clearInterval(interval);
      audioService.stopBgm();
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shakuni Mama Confounded"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#241308] via-[#150a04] to-[#0a0502] border-2 border-[#b45309] shadow-2xl p-6 text-center text-[#e8ded1] overflow-hidden">
        {/* Skip Button */}
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-xs font-cinzel text-[#ffd700] border border-[#d4af37]/40 cursor-pointer transition-colors"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>

        {/* Ambient Dark-Amber Flame Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-radial from-[#d97706]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Title */}
          <span className="text-[11px] font-cinzel tracking-widest text-[#f59e0b] uppercase font-bold">
            The Fate of Hastinapur
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-black text-white mt-0.5">
            Shakuni Mama Confounded!
          </h3>

          {/* Expressive SVG Character Animation */}
          <div className="relative w-56 h-56 my-3 flex items-center justify-center">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="shakuniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5b88f" />
                  <stop offset="100%" stopColor="#b37c56" />
                </linearGradient>
                <linearGradient id="shakuniCrown" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="bucketBronze" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cd7f32" />
                  <stop offset="100%" stopColor="#5c3818" />
                </linearGradient>
              </defs>

              {/* Shoulders / Royal Robes */}
              <g
                className="transition-transform duration-300"
                style={{
                  transform: frame % 2 === 1 ? 'translateY(-3px)' : 'translateY(0)',
                }}
              >
                <path
                  d="M 50,210 Q 120,165 190,210 L 195,240 L 45,240 Z"
                  fill="#450a0a"
                  stroke="#b45309"
                  strokeWidth="2"
                />
                {/* Royal Stole / Shawl */}
                <path
                  d="M 70,195 Q 120,230 170,195"
                  fill="none"
                  stroke="url(#shakuniCrown)"
                  strokeWidth="5"
                />
              </g>

              {/* Head & Neck */}
              <rect x="110" y="140" width="20" height="25" fill="#b37c56" />
              <ellipse cx="120" cy="115" rx="36" ry="42" fill="url(#shakuniSkin)" />

              {/* Mischievous Pointed Ears */}
              <path d="M 84,115 Q 75,105 84,95 Z" fill="#b37c56" />
              <path d="M 156,115 Q 165,105 156,95 Z" fill="#b37c56" />

              {/* Crown of Gandhara */}
              <path
                d="M 85,82 L 120,40 L 155,82 Q 120,74 85,82 Z"
                fill="url(#shakuniCrown)"
                stroke="#451a03"
                strokeWidth="1.5"
              />
              <circle cx="120" cy="62" r="5" fill="#dc2626" />

              {/* Arched Mischievous Eyebrows */}
              <path
                d="M 94,98 Q 106,90 114,97"
                fill="none"
                stroke="#2a140e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 126,97 Q 134,88 146,96"
                fill="none"
                stroke="#2a140e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Cunning Narrow Eyes */}
              <ellipse cx="105" cy="106" rx="5" ry="3" fill="#ffffff" />
              <circle cx="106" cy="106" r="2.2" fill="#1c0f06" />

              <ellipse cx="135" cy="106" rx="5" ry="3" fill="#ffffff" />
              <circle cx="134" cy="106" r="2.2" fill="#1c0f06" />

              {/* Sharp Hooked Nose */}
              <path d="M 120,105 L 124,120 L 117,123" fill="none" stroke="#8a532d" strokeWidth="2" />

              {/* Signature Curled Mustache */}
              <path
                d="M 100,131 Q 120,134 140,131 Q 148,127 150,123"
                fill="none"
                stroke="#170c04"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Laughing Mischievous Mouth with Gold Tooth */}
              <g
                className="transition-all duration-200"
                style={{
                  transformOrigin: '120px 138px',
                  transform: frame % 2 === 1 ? 'scaleY(1.3)' : 'scaleY(0.9)',
                }}
              >
                <path
                  d="M 106,134 Q 120,152 134,134 Z"
                  fill="#581c1c"
                  stroke="#260b0b"
                  strokeWidth="1.5"
                />
                {/* Teeth & Gold tooth */}
                <rect x="115" y="135" width="4" height="4" fill="#ffd700" rx="1" />
                <rect x="119" y="135" width="4" height="3" fill="#ffffff" rx="1" />
              </g>

              {/* Bronze Coin Bucket at Bottom Right */}
              <g transform="translate(145, 155)">
                <path
                  d="M 10,20 L 50,20 L 44,55 L 16,55 Z"
                  fill="url(#bucketBronze)"
                  stroke="#ffd700"
                  strokeWidth="1.5"
                />
                <ellipse cx="30" cy="20" rx="20" ry="6" fill="#3a200f" stroke="#d4af37" strokeWidth="1" />
                {/* Pile of golden coins in bucket */}
                <circle cx="26" cy="19" r="4" fill="#ffd700" stroke="#78350f" strokeWidth="0.5" />
                <circle cx="34" cy="19" r="4" fill="#ffd700" stroke="#78350f" strokeWidth="0.5" />
                <circle cx="30" cy="16" r="4" fill="#ffd700" stroke="#78350f" strokeWidth="0.5" />
              </g>

              {/* Shakuni's Arm reaching into bucket and lifting coin */}
              <g
                className="transition-transform duration-500 ease-out"
                style={{
                  transformOrigin: '80px 180px',
                  transform:
                    frame >= 3
                      ? 'translate(25px, -35px) rotate(-18deg)'
                      : 'translate(0px, 0px)',
                }}
              >
                {/* Arm sleeve */}
                <path d="M 70,180 Q 120,195 160,175" fill="none" stroke="#450a0a" strokeWidth="12" strokeLinecap="round" />
                {/* Forearm & Hand */}
                <circle cx="162" cy="172" r="7" fill="#b37c56" />

                {/* Golden Coin being pulled out */}
                <g transform="translate(160, 160)">
                  <circle
                    cx="5"
                    cy="5"
                    r="9"
                    fill="url(#shakuniCrown)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                  <text x="5" y="8" textAnchor="middle" fontSize="7" fill="#1c0f06" fontWeight="bold">
                    ★
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Shakuni's Dialogue Quote */}
          <div className="p-3 rounded-2xl bg-black/60 border border-[#b45309]/50 max-w-sm">
            <p className="text-xs sm:text-sm text-[#fde047] font-cinzel italic leading-relaxed">
              "My loaded dice... betray me?! Ha ha ha! Take your tribute from my bucket, warrior, but the wheels of Destiny never cease turning!"
            </p>
          </div>

          {/* Status caption */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#d4af37]">
            <Coins className="w-4 h-4 text-[#ffd700] animate-bounce" />
            <span>Shakuni pays 50 Sacred Coins into your treasury!</span>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={onComplete}
            className="mt-5 min-h-[44px] px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-transform cursor-pointer shadow-lg"
          >
            Claim & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
