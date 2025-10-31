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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- FIX 1: fetchUserProfile should only fetch, not manage loading state ---
  // We also wrap its content in a try/catch in case the query itself throws.
  const fetchUserProfile = async (user: User) => {
    if (!user) return; // Guard clause

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (profile) {
        setUserProfile(profile);
        setIsAdmin(profile.is_admin || false);
      }
    } catch (e) {
      console.error('Exception fetching profile:', e);
    }
  };

  useEffect(() => {
    // --- FIX 2: Wrap initial session check in try...finally ---
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (e) {
        console.error('Exception in getSession:', e);
      } finally {
        // This MUST run to unlock the app on initial load
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      // --- FIX 3: Wrap auth state change in try...finally ---
      async (_event: AuthChangeEvent, session: Session | null) => {
        // Set loading to true to show loader during transition
        setLoading(true);
        
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            // User logged out
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (e) {
          console.error('Exception in onAuthStateChange:', e);
        } finally {
          // This MUST run to unlock the app after login/logout
          setLoading(false);
        }
      }
    );

    return () => {
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
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
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
      {/* --- FIX 4: (From last time) ALWAYS render children --- */}
      {/* ProtectedRoute/PublicRoute will use the 'loading' flag to show a spinner */}
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