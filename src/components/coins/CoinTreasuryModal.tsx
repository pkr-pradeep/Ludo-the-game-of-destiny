import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { coinService, CoinState } from '../../services/coins/coinService';
import { Coins, X, History, ShieldAlert, GraduationCap } from 'lucide-react';

export interface CoinTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLearnAndEarn?: () => void;
}

export const CoinTreasuryModal: React.FC<CoinTreasuryModalProps> = ({
  isOpen,
  onClose,
  onOpenLearnAndEarn,
}) => {
  const [coinState, setCoinState] = useState<CoinState>(() => coinService.getState());

  useEffect(() => {
    const unsubscribe = coinService.subscribe((newState) => {
      setCoinState(newState);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coin-treasury-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c140d] via-[#120d08] to-[#080503] border border-[#d4af37]/60 shadow-2xl p-5 sm:p-6 text-[#e8ded1]">
        {/* Header - Matching AudioSettingsModal with Cancel (X) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Exit popup"
              title="Close"
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer mr-1"
            >
              <X className="w-5 h-5" />
            </button>
            <Coins className="w-5 h-5 text-[#ffd700]" />
            <h3 id="coin-treasury-title" className="text-base sm:text-lg font-cinzel font-bold text-[#f5ecd8]">
              Sacred Coin Treasury
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close coin treasury"
            title="Close"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Balance Row (Matching Audio Master style) */}
        <div className="mt-4 p-3 rounded-2xl bg-[#090604] border border-[#d4af37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-cinzel font-semibold text-white">
            <div className="w-8 h-8 rounded-full bg-[#ffd700]/15 border border-[#ffd700]/40 flex items-center justify-center text-[#ffd700] shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#c8b69b] uppercase tracking-wider block">Balance</span>
              <span className="font-mono text-sm sm:text-base text-[#fef08a] font-bold tabular-nums">
                {coinState.balance} Sacred Coins
              </span>
            </div>
          </div>
          <span className="min-h-[36px] px-3.5 py-1 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider bg-emerald-950 text-emerald-200 border border-emerald-500/50 flex items-center">
            Virtual
          </span>
        </div>

        {/* Learn & Earn Option (Matching Audio Control Cards) */}
        <div className="mt-4 p-3 rounded-2xl bg-[#090604] border border-[#d4af37]/30 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ffd700] to-[#b45309] flex items-center justify-center text-[#1c1510] shadow shrink-0">
              <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-cinzel font-bold text-white">Learn & Earn</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ffd700]/20 text-[#fef08a] font-mono font-bold border border-[#ffd700]/30">
                  +50 Coins
                </span>
              </div>
              <span className="text-[10px] text-[#c8b69b] block">
                Daily Gita & Vedic Math Trivia
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenLearnAndEarn) onOpenLearnAndEarn();
            }}
            className="min-h-[36px] px-4 py-1 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] border border-[#ffd700] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow shrink-0"
          >
            Play Quiz
          </button>
        </div>

        {/* Recent Activity Ledger (Matching Language selection section) */}
        <div className="mt-5 pt-3 border-t border-[#d4af37]/20 text-left">
          <div className="flex items-center justify-between text-xs text-[#c8b69b] font-cinzel font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#ffd700]" />
              Recent Treasury Ledger
            </span>
            <span className="text-[10px] font-mono text-[#c8b69b]/80">
              {coinState.transactions.length} records
            </span>
          </div>

          <div className="max-h-24 overflow-y-auto space-y-1.5 text-xs pr-1">
            {coinState.transactions.length === 0 ? (
              <p className="text-center text-[#c8b69b]/60 italic py-2 text-[11px]">
                No transactions recorded yet.
              </p>
            ) : (
              coinState.transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#140e08] border border-[#d4af37]/20"
                >
                  <span className="text-[#e8ded1] text-[11px] truncate font-medium max-w-[210px]">
                    {tx.reason}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold shrink-0 ${
                      tx.amount >= 0 ? 'text-[#86efac]' : 'text-[#fca5a5]'
                    }`}
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-3 p-2 rounded-xl bg-[#090604]/50 border border-[#d4af37]/20 text-[10px] text-[#c8b69b] flex items-center gap-2 text-left">
          <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
          <span>Virtual gameplay coins only. No real money or cash redemption.</span>
        </div>

        {/* Footer (Matching AudioSettingsModal) */}
        <div className="mt-6 pt-3 border-t border-[#d4af37]/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wide cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
