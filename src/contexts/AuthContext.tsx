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

// Helper function to fetch profile
const fetchUserProfile = async (user: User) => {
  if (!user) return null;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return profile || null;
  } catch (e) {
    console.error('Exception fetching profile:', e);
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

    // --- THIS IS THE FIX ---
    // 1. Check the initial session on mount
    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return; // Don't update state if unmounted

        setUser(session?.user ?? null);
        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          if (mounted && profile) {
            setUserProfile(profile);
            setIsAdmin(profile.is_admin || false);
          }
        }
      } catch (e) {
        console.error("Error getting initial session: ", e);
      } finally {
        // Always set loading to false after initial check
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
          // On sign-in, show loader while fetching profile
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
        // We no longer set loading(true) for TOKEN_REFRESHED,
        // preventing the loading flash and potential infinite load.
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
      {/* The routes (ProtectedRoute) will handle the loading state. */}
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