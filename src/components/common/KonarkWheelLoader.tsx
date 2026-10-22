import React from 'react';

export interface KonarkWheelLoaderProps {
  /** Size in pixels or preset keyword */
  size?: number | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Optional loading text caption */
  label?: string;
  /** Whether to show the text caption (default: true) */
  showLabel?: boolean;
  /** Rotation speed (default: 'normal') */
  speed?: 'slow' | 'normal' | 'fast';
  /** Variant: authentic stone photograph or carved SVG illustration (default: 'photo') */
  variant?: 'photo' | 'svg';
  /** Optional container class name */
  className?: string;
}

const SIZE_MAP: Record<string, number> = {
  sm: 48,
  md: 80,
  lg: 128,
  xl: 180,
  '2xl': 240,
};

const SPEED_MAP: Record<string, string> = {
  slow: '24s',
  normal: '14s',
  fast: '7s',
};

/**
 * Reusable Konark Sun Temple Wheel Loading Component
 * An original illustration and authentic stone representation of the 13th-century Konark Sun Temple (Surya Deula)
 * of Odisha, featuring intricate spokes, beaded rims, sandstone textures, and gold accents.
 * Fully responsive and respects prefers-reduced-motion preferences.
 */
export const KonarkWheelLoader: React.FC<KonarkWheelLoaderProps> = ({
  size = 'md',
  label = 'Invoking the Wheels of Destiny...',
  showLabel = true,
  speed = 'normal',
  variant = 'photo',
  className = '',
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 80;
  const animDuration = SPEED_MAP[speed] || '14s';

  // 8 major spokes at 45 degree intervals (0, 45, 90, 135, 180, 225, 270, 315)
  const majorSpokes = [0, 45, 90, 135, 180, 225, 270, 315];
  // 8 minor spokes alternating at 22.5 degree offsets
  const minorSpokes = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex flex-col items-center justify-center gap-3 select-none ${className}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Ambient solar aura */}
        <div
          className="absolute inset-0 rounded-full bg-radial from-[#d4af37]/25 via-[#b45309]/10 to-transparent blur-md pointer-events-none"
          aria-hidden="true"
        />

        {/* Authentic Stone Chariot Wheel Photo Variant */}
        {variant === 'photo' ? (
          <img
            src="/assets/aistudio/image_ca70523e.png"
            alt="Konark Sun Temple Wheel"
            width={pixelSize}
            height={pixelSize}
            className="relative konark-wheel-rotate object-contain select-none pointer-events-none drop-shadow-[0_0_12px_rgba(212,175,55,0.45)]"
            style={{
              width: pixelSize,
              height: pixelSize,
              animation: `konarkSpin ${animDuration} linear infinite`,
            }}
          />
        ) : (
          /* Rotating Konark Chakra Wheel SVG */
          <svg
            viewBox="0 0 400 400"
            width={pixelSize}
            height={pixelSize}
            className="relative konark-wheel-rotate text-[#d4af37]"
            style={{
              animation: `konarkSpin ${animDuration} linear infinite`,
            }}
            aria-hidden="true"
          >
          <defs>
            {/* Sandstone linear gradient */}
            <linearGradient id="sandstoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dfd3c3" />
              <stop offset="40%" stopColor="#c8b69b" />
              <stop offset="70%" stopColor="#8c7355" />
              <stop offset="100%" stopColor="#4a3728" />
            </linearGradient>

            {/* Sun Temple Gold gradient */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="35%" stopColor="#d4af37" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Axle radial depth */}
            <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff1c2" />
              <stop offset="40%" stopColor="#d4af37" />
              <stop offset="75%" stopColor="#8c7355" />
              <stop offset="100%" stopColor="#2d2218" />
            </radialGradient>

            {/* Drop shadow for carved relief */}
            <filter id="reliefShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Outer Most Stone Tire with Carved Relief Beads */}
          <circle
            cx="200"
            cy="200"
            r="192"
            fill="none"
            stroke="url(#sandstoneGrad)"
            strokeWidth="10"
            filter="url(#reliefShadow)"
          />
          <circle
            cx="200"
            cy="200"
            r="184"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* Secondary Beaded Outer Rim */}
          <circle
            cx="200"
            cy="200"
            r="174"
            fill="none"
            stroke="#4a3728"
            strokeWidth="8"
          />
          <circle
            cx="200"
            cy="200"
            r="168"
            fill="none"
            stroke="url(#sandstoneGrad)"
            strokeWidth="4"
          />

          {/* Inner Rim */}
          <circle
            cx="200"
            cy="200"
            r="156"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
          />

          {/* --- 8 MINOR SPOKES (Slender decorative carved needles) --- */}
          {minorSpokes.map((deg) => (
            <g key={`minor-${deg}`} transform={`rotate(${deg} 200 200)`}>
              {/* Shaft */}
              <line
                x1="200"
                y1="60"
                x2="200"
                y2="140"
                stroke="url(#sandstoneGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Central filigree diamond */}
              <polygon
                points="200,92 205,100 200,108 195,100"
                fill="url(#goldGrad)"
              />
              <circle cx="200" cy="100" r="2" fill="#2d2218" />
            </g>
          ))}

          {/* --- 8 MAJOR SPOKES (Broad sculpted sundial pillars with medallions) --- */}
          {majorSpokes.map((deg) => (
            <g key={`major-${deg}`} transform={`rotate(${deg} 200 200)`}>
              {/* Main Spoke Pillar Body */}
              <polygon
                points="192,48 208,48 206,145 194,145"
                fill="url(#sandstoneGrad)"
                stroke="#2d2218"
                strokeWidth="1.5"
                filter="url(#reliefShadow)"
              />
              {/* Spoke center flute */}
              <line
                x1="200"
                y1="54"
                x2="200"
                y2="140"
                stroke="url(#goldGrad)"
                strokeWidth="2.5"
              />

              {/* Medallion: Outer carved stone circle */}
              <circle
                cx="200"
                cy="96"
                r="16"
                fill="#3a2b1f"
                stroke="url(#goldGrad)"
                strokeWidth="2"
              />
              {/* Medallion: Inner sacred sundial rosette */}
              <circle
                cx="200"
                cy="96"
                r="11"
                fill="url(#sandstoneGrad)"
              />
              <circle
                cx="200"
                cy="96"
                r="6"
                fill="url(#goldGrad)"
              />
              <circle
                cx="200"
                cy="96"
                r="2.5"
                fill="#17110c"
              />

              {/* Base connector scroll */}
              <circle
                cx="200"
                cy="142"
                r="5"
                fill="url(#goldGrad)"
              />
            </g>
          ))}

          {/* --- CENTRAL AXLE & HUB (The Great Hub of Surya's Chariot) --- */}
          {/* Outer Hub Ring */}
          <circle
            cx="200"
            cy="200"
            r="56"
            fill="#2d2218"
            stroke="url(#sandstoneGrad)"
            strokeWidth="6"
            filter="url(#reliefShadow)"
          />

          {/* Beaded Ring around Hub */}
          <circle
            cx="200"
            cy="200"
            r="46"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Raised Central Axle Boss */}
          <circle
            cx="200"
            cy="200"
            r="38"
            fill="url(#hubGrad)"
            stroke="#17110c"
            strokeWidth="2"
          />

          {/* Central Lotus Flower Carving */}
          <g transform="translate(200, 200)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <path
                key={`petal-${angle}`}
                d="M 0,-18 Q 4,-10 0,0 Q -4,-10 0,-18"
                fill="url(#goldGrad)"
                stroke="#4a3728"
                strokeWidth="0.8"
                transform={`rotate(${angle})`}
              />
            ))}
            {/* Center Golden Bindu */}
            <circle cx="0" cy="0" r="7" fill="#fff7d6" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2.5" fill="#4a3728" />
          </g>
        </svg>
        )}

        <style>{`
          @keyframes konarkSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .konark-wheel-rotate {
              animation: none !important;
            }
          }
        `}</style>
      </div>

      {showLabel && label && (
        <p className="text-xs tracking-wider uppercase font-cinzel text-[#d4af37] text-center max-w-xs animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
