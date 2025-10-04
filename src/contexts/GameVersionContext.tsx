import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface GameVersionContextType {
  gameVersion: string;
  setGameVersion: (version: string) => void;
}

const GameVersionContext = createContext<GameVersionContextType | undefined>(undefined);

export const useGameVersion = () => {
  const context = useContext(GameVersionContext);
  if (!context) {
    throw new Error('useGameVersion must be used within a GameVersionProvider');
  }
  return context;
};

export const GameVersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameVersion, setGameVersion] = useLocalStorage('gameVersion', 'FC26');

  const value = {
    gameVersion,
    setGameVersion,
  };

  return (
    <GameVersionContext.Provider value={value}>
      {children}
    </GameVersionContext.Provider>
  );
};
