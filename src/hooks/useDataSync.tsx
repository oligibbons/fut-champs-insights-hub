// src/hooks/useDataSync.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Run, Player, Squad } from '@/types/futChampions';

// (Assuming types are defined here or imported)
interface DataSyncContextType {
  runs: Run[] | undefined;
  players: Player[] | undefined;
  squads: Squad[] | undefined;
  isLoading: boolean;
  isInitialSyncComplete: boolean;
  // Add other mutations and data as needed from your original file
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(
  undefined,
);

export const DataSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);

  // --- Data Fetching ---
  const fetchRuns = async () => {
    if (!user) return [];
    // --- THIS IS THE FIX ---
    // The table is 'weekly_performances', not 'runs'
    const { data, error } = await supabase
      .from('weekly_performances') // <-- Was 'runs'
      .select('*')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return data || [];
  };

  const fetchPlayers = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return data || [];
  };

  const fetchSquads = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('squads')
      .select('*')
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return data || [];
  };

  // --- React Query Hooks ---
  const {
    data: runs,
    isLoading: isLoadingRuns,
    isError: isErrorRuns,
  } = useQuery<Run[]>({
    queryKey: ['runs', user?.id], // This queryKey is fine, it's just a label
    queryFn: fetchRuns,
    enabled: !!user,
  });

  const {
    data: players,
    isLoading: isLoadingPlayers,
    isError: isErrorPlayers,
  } = useQuery<Player[]>({
    queryKey: ['players', user?.id],
    queryFn: fetchPlayers,
    enabled: !!user,
  });

  const {
    data: squads,
    isLoading: isLoadingSquads,
    isError: isErrorSquads,
  } = useQuery<Squad[]>({
    queryKey: ['squads', user?.id],
    queryFn: fetchSquads,
    enabled: !!user,
  });

  // This effect now correctly determines when the initial sync is complete
  useEffect(() => {
    if (user) {
      // Check if any essential query is still loading
      const isSyncing = isLoadingRuns || isLoadingPlayers || isLoadingSquads;

      // Check if any essential query has failed
      const hasError = isErrorRuns || isErrorPlayers || isErrorSquads;

      // If we are no longer syncing (and not in an error state
      // that we're waiting on), mark sync as complete.
      if (!isSyncing && !hasError) {
        setIsInitialSyncComplete(true);
      }

      // If any query has an error, we should also stop "loading"
      // so the UI can render the error state instead of a spinner.
      if (hasError) {
        setIsInitialSyncComplete(true);
      }
    } else if (!user) {
      // User logged out, reset the sync flag for the next login
      setIsInitialSyncComplete(false);
    }
  }, [
    user,
    isLoadingRuns,
    isLoadingPlayers,
    isLoadingSquads,
    isErrorRuns,
    isErrorPlayers,
    isErrorSquads,
  ]);
  // --- END OF FIX ---

  // --- Mutations (Add your mutations here from your original file) ---
  // Example:
  // const addRun = useMutation(...)
  // const updateGame = useMutation(...)

  const value = {
    runs,
    players,
    squads,
    // This is the loading state the dashboard pages (like Index.tsx) are using
    isLoading: !isInitialSyncComplete && !!user,
    isInitialSyncComplete,
    // Add your mutations to the context value here
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (context === undefined) {
    throw new Error('useDataSync must be in use within a DataSyncProvider');
  }
  return context;
};