import React, { useState, useEffect } from 'react';
import { coinService, CoinState } from '../../services/coins/coinService';
import { Coins, X, History, ShieldAlert } from 'lucide-react';

export interface CoinBucketProps {
  className?: string;
}

export const CoinBucket: React.FC<CoinBucketProps> = ({ className = '' }) => {
  const [coinState, setCoinState] = useState<CoinState>(() => coinService.getState());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    let prevBalance = coinService.getBalance();
    const unsubscribe = coinService.subscribe((newState) => {
      if (newState.balance > prevBalance) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1200);
      }
      prevBalance = newState.balance;
      setCoinState(newState);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      {/* Coin Bucket Trigger Button in Navigation / Header */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label={`Treasury Balance: ${coinState.balance} Sacred Coins`}
        title="View Coin Treasury & Ledger"
        className={`min-h-[44px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2a1d12] via-[#1a130b] to-[#0d0905] border border-[#d4af37]/50 shadow-md flex items-center gap-2 text-xs font-cinzel text-[#ffd700] hover:brightness-110 active:scale-95 transition-all cursor-pointer ${className}`}
      >
        {/* Animated Coin Bucket Icon */}
        <div className={`relative flex items-center justify-center ${isAnimating ? 'animate-bounce' : ''}`}>
          <Coins className="w-4 h-4 text-[#ffd700]" />
          {isAnimating && (
            <span className="absolute -top-3 -right-2 text-[10px] font-bold text-[#86efac] animate-ping">
              +
            </span>
          )}
        </div>
        <span className="tabular-nums font-mono font-bold text-sm tracking-tight text-[#fef08a]">
          {coinState.balance}
        </span>
        <span className="hidden sm:inline text-[10px] text-[#c8b69b] uppercase tracking-wider font-semibold">
          Coins
        </span>
      </button>

      {/* Coin Treasury & Ledger Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="treasury-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c140d] via-[#120d08] to-[#080503] border border-[#d4af37]/60 shadow-2xl p-5 sm:p-6 text-[#e8ded1]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#ffd700]" />
                <h3 id="treasury-title" className="text-base sm:text-lg font-cinzel font-bold text-[#f5ecd8]">
                  Sacred Coin Treasury
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close treasury dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big Bucket Balance Graphic */}
            <div className="my-5 p-5 rounded-2xl bg-[#090604] border border-[#d4af37]/30 flex flex-col items-center justify-center text-center shadow-inner">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#78350f] p-1 flex items-center justify-center shadow-lg mb-2">
                <div className="w-full h-full rounded-full bg-[#17100a] flex items-center justify-center">
                  <Coins className="w-10 h-10 text-[#ffd700]" />
                </div>
              </div>
              <span className="text-3xl font-mono font-bold text-[#ffd700] tabular-nums">
                {coinState.balance}
              </span>
              <span className="text-xs font-cinzel text-[#c8b69b] uppercase tracking-widest mt-0.5">
                Total Virtual Coins
              </span>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#2a1d12]/50 border border-[#d4af37]/20 text-[11px] text-[#dfd3c3] leading-relaxed mb-4">
              <ShieldAlert className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
              <span>
                Virtual coins are for game progression and Learn & Earn trivia. No real-money purchases, cash redemption, betting, or gambling.
              </span>
            </div>

            {/* Transaction Ledger */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-cinzel text-[#c8b69b] uppercase tracking-wider mb-2">
                <History className="w-3.5 h-3.5" />
                <span>Recent Treasury Ledger</span>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5 text-xs">
                {coinState.transactions.length === 0 ? (
                  <p className="text-center text-[#c8b69b]/60 italic py-3">No transactions recorded yet.</p>
                ) : (
                  coinState.transactions.slice(0, 15).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#140e09] border border-[#d4af37]/15"
                    >
                      <div className="flex flex-col text-left truncate pr-2">
                        <span className="text-[#e8ded1] truncate font-medium">{tx.reason}</span>
                        <span className="text-[10px] text-[#8c7355] font-mono">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold shrink-0 ${
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

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-[#d4af37]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wide cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
