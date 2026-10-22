import React, { useState, useEffect } from 'react';
import { useLudoGame } from '../engine/useLudoGame';
import { soundManager } from '../utils/sound';
import { audioService } from '../services/audio/audioService';
import { TurnHUD } from '../components/game/TurnHUD';
import { LudoBoard } from '../components/board/LudoBoard';
import { DiceRoller } from '../components/game/DiceRoller';
import { RulesModal } from '../components/modals/RulesModal';
import { VictoryModal } from '../components/modals/VictoryModal';
import { ShakuniAnimation } from '../components/character/ShakuniAnimation';
import { KrishnaVictoryModal } from '../components/character/KrishnaVictoryModal';
import { AudioSettingsModal } from '../components/settings/AudioSettingsModal';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

export interface GameScreenProps {
  playerCount?: number;
  onHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onHome }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Victory cinematic states
  const [matchId, setMatchId] = useState<string>(() => `match-${Date.now()}`);
  const [showShakuni, setShowShakuni] = useState<boolean>(false);
  const [showKrishna, setShowKrishna] = useState<boolean>(false);
  const [hasTriggeredVictoryCinematic, setHasTriggeredVictoryCinematic] = useState<boolean>(false);

  const {
    players,
    activeColors,
    currentColor,
    diceValue,
    isRolling,
    hasRolled,
    availableMoves,
    captureBanner,
    clearCaptureBanner,
    logs,
    winner,
    rollDice,
    executeMove,
    restartGame,
  } = useLudoGame();

  // Play gameplay BGM when entering GameScreen
  useEffect(() => {
    audioService.playBgm('gameplay');
  }, []);

  // When human player wins (Red / Kalinga), trigger Shakuni defeat first, then Krishna victory!
  useEffect(() => {
    if (winner && !hasTriggeredVictoryCinematic) {
      setHasTriggeredVictoryCinematic(true);
      if (winner.color === 'red') {
        setShowShakuni(true);
      }
    }
  }, [winner, hasTriggeredVictoryCinematic]);

  const handleRestart = () => {
    restartGame();
    setMatchId(`match-${Date.now()}`);
    setShowShakuni(false);
    setShowKrishna(false);
    setHasTriggeredVictoryCinematic(false);
    audioService.playBgm('gameplay');
  };

  const handleShakuniFinish = () => {
    setShowShakuni(false);
    setShowKrishna(true);
  };

  const handleKrishnaClose = () => {
    setShowKrishna(false);
  };

  const handleToggleMute = () => {
    const nextVal = soundManager.toggleMute();
    setIsMuted(nextVal);
    audioService.toggleMute();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-temple-pattern relative overflow-x-hidden select-none">
      {/* Top Turn HUD */}
      <TurnHUD
        currentColor={currentColor}
        players={players}
        activeColors={activeColors}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onHome={onHome}
        onRestart={handleRestart}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Board Arena */}
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center px-2 py-3 sm:py-4 gap-3">
        {/* The 15x15 Square Ludo Board */}
        <LudoBoard
          players={players}
          currentColor={currentColor}
          availableMoves={availableMoves}
          onTokenClick={executeMove}
          activeColors={activeColors}
        />

        {/* Dice Roller & Turn Instructions with Capture Banner */}
        <div className="w-full max-w-[min(94vw,500px)] bg-[#0d1629]/80 backdrop-blur-sm p-3 rounded-2xl border border-[#d4af37]/30 shadow-lg mt-1">
          <DiceRoller
            currentColor={currentColor}
            diceValue={diceValue}
            isRolling={isRolling}
            hasRolled={hasRolled}
            availableMovesCount={availableMoves.length}
            onRoll={rollDice}
            disabled={Boolean(winner)}
            captureMessage={captureBanner}
            onDismissCapture={clearCaptureBanner}
          />
        </div>

        {/* Destiny Chronicle / Collapsible Game Log */}
        <div className="w-full max-w-[min(94vw,500px)]">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0f1930]/90 border border-[#d4af37]/20 text-xs font-cinzel text-[#c8b69b] hover:text-[#ffd700] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>Destiny Chronicle ({logs.length} entries)</span>
            </div>
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showLogs && (
            <div className="mt-1.5 p-2 rounded-xl bg-[#090f1d] border border-[#d4af37]/20 max-h-36 overflow-y-auto text-[11px] space-y-1.5">
              {logs.length === 0 ? (
                <div className="text-center text-[#c8b69b]/60 italic py-2">
                  Cast the dice to begin the chronicle...
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-1.5 text-[#e2d5c3] leading-snug"
                  >
                    <span className="text-[#8c7355] font-mono text-[9px] shrink-0 pt-0.5">
                      {log.timestamp}
                    </span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Shakuni Mama Confounded Loss Animation (triggers first on human victory) */}
      <ShakuniAnimation
        isOpen={showShakuni}
        onComplete={handleShakuniFinish}
        onSkip={handleShakuniFinish}
      />

      {/* Lord Krishna Divine Victory Celebration & Gita Verse Blessing */}
      <KrishnaVictoryModal
        isOpen={showKrishna}
        matchId={matchId}
        winnerName={winner?.name || 'Kalinga Warrior'}
        onClose={handleKrishnaClose}
        onPlayAgain={handleRestart}
      />

      {/* General Victory Modal for other winner scenarios */}
      {winner && winner.color !== 'red' && !showShakuni && !showKrishna && (
        <VictoryModal
          winner={winner}
          onPlayAgain={handleRestart}
          onHome={onHome}
        />
      )}

      {/* Modals & Audio Settings */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
