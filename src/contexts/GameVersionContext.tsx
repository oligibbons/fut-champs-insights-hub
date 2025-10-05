import { createContext, useContext, useState, ReactNode } from 'react';

// Defines the only possible game versions for the entire app.
// Changed from 'FC24' | 'FC25' to 'FC25' | 'FC26'.
type GameVersion = 'FC25' | 'FC26';

interface GameVersionContextType {
  gameVersion: GameVersion;
  setGameVersion: (version: GameVersion) => void;
}

// Create the context that components will use to get the game version.
const GameVersionContext = createContext<GameVersionContextType | undefined>(undefined);

// This component wraps your application and provides the game version state.
export const GameVersionProvider = ({ children }: { children: ReactNode }) => {
  // Set the default game version to 'FC26' as requested.
  // When the app first loads, this is the version that will be active.
  const [gameVersion, setGameVersion] = useState<GameVersion>('FC26');

  const value = { gameVersion, setGameVersion };

  return (
    <GameVersionContext.Provider value={value}>
      {children}
    </GameVersionContext.Provider>
  );
};

// This is a custom hook that components use to easily access the game version.
// e.g., const { gameVersion } = useGameVersion();
export const useGameVersion = () => {
  const context = useContext(GameVersionContext);
  if (context === undefined) {
    throw new Error('useGameVersion must be used within a GameVersionProvider');
  }
  return context;
};
