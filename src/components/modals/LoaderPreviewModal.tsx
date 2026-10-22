import React, { useState } from 'react';
import { KonarkWheelLoader } from '../common/KonarkWheelLoader';
import { X, Sparkles, Sliders } from 'lucide-react';

export interface LoaderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoaderPreviewModal: React.FC<LoaderPreviewModalProps> = ({ isOpen, onClose }) => {
  const [sizePreset, setSizePreset] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [variant, setVariant] = useState<'photo' | 'svg'>('photo');
  const [showLabel, setShowLabel] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loader-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#1c140d] via-[#120d08] to-[#080503] border border-[#d4af37]/60 shadow-2xl p-5 sm:p-6 text-[#e8ded1]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ffd700]" />
            <h3 id="loader-preview-title" className="text-base sm:text-lg font-cinzel font-bold text-[#f5ecd8]">
              Konark Sun Temple Wheel Component
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Preview Canvas */}
        <div className="my-6 p-6 rounded-xl bg-[#090604] border border-[#d4af37]/30 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-[#d4af37]/5 via-transparent to-transparent pointer-events-none" />
          <KonarkWheelLoader
            size={sizePreset}
            speed={speed}
            variant={variant}
            showLabel={showLabel}
            label="Carving the Cosmic Hours at Konark..."
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 text-xs">
          {/* Style Selector */}
          <div>
            <span className="text-[#c8b69b] block mb-1.5 font-medium">Wheel Style:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVariant('photo')}
                className={`min-h-[36px] px-3.5 py-1 rounded-lg uppercase tracking-wider font-cinzel text-[11px] font-bold transition-colors cursor-pointer ${
                  variant === 'photo'
                    ? 'bg-[#d4af37] text-[#1c1510] shadow-md'
                    : 'bg-[#1b253b]/60 text-[#c8b69b] hover:bg-[#1b253b]'
                }`}
              >
                Authentic Stone Wheel
              </button>
              <button
                type="button"
                onClick={() => setVariant('svg')}
                className={`min-h-[36px] px-3.5 py-1 rounded-lg uppercase tracking-wider font-cinzel text-[11px] font-bold transition-colors cursor-pointer ${
                  variant === 'svg'
                    ? 'bg-[#d4af37] text-[#1c1510] shadow-md'
                    : 'bg-[#1b253b]/60 text-[#c8b69b] hover:bg-[#1b253b]'
                }`}
              >
                Carved Vector SVG
              </button>
            </div>
          </div>

          {/* Size Selectors */}
          <div>
            <span className="text-[#c8b69b] block mb-1.5 font-medium">Dimension Preset:</span>
            <div className="flex flex-wrap gap-2">
              {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSizePreset(s)}
                  className={`min-h-[36px] px-3 py-1 rounded-lg uppercase tracking-wider font-mono text-[11px] transition-colors cursor-pointer ${
                    sizePreset === s
                      ? 'bg-[#d4af37] text-[#1c1510] font-bold shadow-md'
                      : 'bg-[#1b253b]/60 text-[#c8b69b] hover:bg-[#1b253b]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Selectors */}
          <div>
            <span className="text-[#c8b69b] block mb-1.5 font-medium">Rotation Tempo:</span>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSpeed(sp)}
                  className={`min-h-[36px] px-3.5 py-1 rounded-lg uppercase tracking-wider font-mono text-[11px] transition-colors cursor-pointer ${
                    speed === sp
                      ? 'bg-[#d4af37] text-[#1c1510] font-bold shadow-md'
                      : 'bg-[#1b253b]/60 text-[#c8b69b] hover:bg-[#1b253b]'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Caption */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[#c8b69b]">Display Vedic Inscription Label:</span>
            <button
              type="button"
              onClick={() => setShowLabel(!showLabel)}
              className={`min-h-[32px] px-3 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                showLabel ? 'bg-emerald-800/80 text-emerald-200' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showLabel ? 'Visible' : 'Hidden'}
            </button>
          </div>

          <p className="text-[11px] text-[#c8b69b]/70 italic pt-1">
            * Note: System `prefers-reduced-motion` will automatically halt rotation and preserve legibility.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#d4af37]/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#2a1f16] text-[#dfd3c3] hover:text-white hover:bg-[#3d2d20] font-cinzel text-xs uppercase tracking-wide cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
