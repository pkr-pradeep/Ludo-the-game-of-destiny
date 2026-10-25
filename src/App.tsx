import React, { useState } from 'react';
import { HomeScreen, StartGameConfig } from './pages/HomeScreen';
import { GameScreen } from './pages/GameScreen';
import { PlayerColor } from './types/game';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('red');
  const [activePlayers, setActivePlayers] = useState<PlayerColor[]>(['red', 'green']);

  const handleStartGame = (config: StartGameConfig) => {
    setPlayerCount(config.playerCount);
    setPlayerColor(config.playerColor);
    setActivePlayers(config.activePlayers);
    setCurrentView('game');
  };

  const handleReturnHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="w-full min-h-screen bg-[#0b1329] text-[#e8ded1]">
      {currentView === 'home' ? (
        <HomeScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen
          playerCount={playerCount}
          playerColor={playerColor}
          activePlayers={activePlayers}
          onHome={handleReturnHome}
        />
      )}
    </div>
  );
}
