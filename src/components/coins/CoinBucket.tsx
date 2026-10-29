import React, { useState, useEffect } from 'react';
import { coinService, CoinState } from '../../services/coins/coinService';
import { Coins } from 'lucide-react';
import { CoinTreasuryModal } from './CoinTreasuryModal';

export interface CoinBucketProps {
  className?: string;
  onClick?: () => void;
  onOpenLearnAndEarn?: () => void;
}

export const CoinBucket: React.FC<CoinBucketProps> = ({
  className = '',
  onClick,
  onOpenLearnAndEarn,
}) => {
  const [coinState, setCoinState] = useState<CoinState>(() => coinService.getState());
  const [isInternalModalOpen, setIsInternalModalOpen] = useState<boolean>(false);
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

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsInternalModalOpen(true);
    }
  };

  return (
    <>
      {/* Coin Trigger Button in Header */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Treasury Balance: ${coinState.balance} Sacred Coins`}
        title="View Sacred Coin Treasury & Learn & Earn"
        className={`min-h-[38px] px-3 py-1 rounded-xl bg-gradient-to-r from-[#2a1d12] via-[#1a130b] to-[#0d0905] border border-[#d4af37]/60 shadow-md flex items-center gap-2 text-xs font-cinzel text-[#ffd700] hover:brightness-110 active:scale-95 transition-all cursor-pointer ${className}`}
      >
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
        <span className="hidden xs:inline text-[10px] text-[#c8b69b] uppercase tracking-wider font-semibold">
          Coins
        </span>
      </button>

      {/* Fallback Internal Modal if onClick not provided */}
      {!onClick && (
        <CoinTreasuryModal
          isOpen={isInternalModalOpen}
          onClose={() => setIsInternalModalOpen(false)}
          onOpenLearnAndEarn={onOpenLearnAndEarn}
        />
      )}
    </>
  );
};
