// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_admin: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email, password) => Promise<{ error: any }>;
  signUp: (email, password, username) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- THIS IS THE FIX (Part 1) ---
// Create a timeout promise that rejects after 'ms' milliseconds
// Increased to 10 seconds (10000ms) as a safe fallback for cold starts,
// although the main fix is sequencing in the data hooks.
const createTimeout = (ms: number, message: string) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
};

// Helper function to fetch profile
const fetchUserProfile = async (user: User) => {
  if (!user) return null;
  
  try {
    // The actual Supabase query
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // --- THIS IS THE FIX (Part 2) ---
    // Race the query against a 10-second (10000ms) timeout
    const { data: profile, error } = await Promise.race([
      fetchPromise,
      createTimeout(10000, 'Profile query timed out. Check RLS policies on "profiles" table.')
    ]) as { data: UserProfile | null, error: any }; // Cast the result

    if (error) {
      // This will now catch both Supabase errors AND our timeout error
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return profile || null;
  } catch (e: any) {
    // This catches the rejection from createTimeout or other exceptions
    console.error('Exception fetching profile (likely timeout):', e.message);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Start true for initial load

  useEffect(() => {
    let mounted = true;

    // 1. Check the initial session on mount
    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return; // Don't update state if unmounted

        setUser(session?.user ?? null);
        if (session?.user) {
          // This call will now time out if it hangs
          const profile = await fetchUserProfile(session.user);
          if (mounted && profile) {
            setUserProfile(profile);
            setIsAdmin(profile.is_admin || false);
          }
        }
      } catch (e) {
        console.error("Error getting initial session: ", e);
      } finally {
        // This will now *always* run, even if fetchUserProfile times out,
        // which stops the infinite loading screen.
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // 2. Listen for *subsequent* auth changes (SIGN_IN, SIGN_OUT)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        // Set user immediately
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          // On sign-in, show loader while fetching profile (with timeout)
          setLoading(true);
          const profile = await fetchUserProfile(session.user);
          if (mounted) {
            setUserProfile(profile);
            setIsAdmin(profile?.is_admin || false);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // On sign-out, just clear data
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // The onAuthStateChange listener will handle fetching the profile
    return { error };
  };

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username, // Default display_name to username
        },
      },
    });
    // The onAuthStateChange listener will handle setting the user
    // The database trigger will create the profile
        
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Listener will handle clearing state
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
