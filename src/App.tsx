import React, { useState } from 'react';
import { HomeScreen } from './pages/HomeScreen';
import { GameScreen } from './pages/GameScreen';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);

  const handleStartGame = (count: 2 | 3 | 4) => {
    setPlayerCount(count);
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
        <GameScreen playerCount={playerCount} onHome={handleReturnHome} />
      )}
    </div>
  );
}
