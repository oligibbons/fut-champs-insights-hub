import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

type GameVersion = 'FC25' | 'FC26';

interface GameVersionContextType {
  gameVersion: GameVersion;
  setGameVersion: (version: GameVersion) => void;
}

const GameVersionContext = createContext<GameVersionContextType | undefined>(undefined);

export const GameVersionProvider = ({ children }: { children: ReactNode }) => {
  const [gameVersion, setGameVersion] = useState<GameVersion>('FC26');

  // FIX: Memoize the context value
  const value = useMemo(() => ({
    gameVersion,
    setGameVersion,
  }), [gameVersion]);

  return (
    <GameVersionContext.Provider value={value}>
      {children}
    </GameVersionContext.Provider>
  );
};

export const useGameVersion = () => {
  const context = useContext(GameVersionContext);
  if (context === undefined) {
    throw new Error('useGameVersion must be used within a GameVersionProvider');
  }
  return context;
};
