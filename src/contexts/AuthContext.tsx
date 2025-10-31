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

  const fetchUserProfile = async (user: User) => {
    // This helper function just fetches and sets profile data
    if (!user) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setUserProfile(null);
        setIsAdmin(false);
      } else if (profile) {
        setUserProfile(profile);
        setIsAdmin(profile.is_admin || false);
      }
    } catch (e) {
      console.error('Exception fetching profile:', e);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // We REMOVE the getSession() call.
    // onAuthStateChange handles the initial load AND all auth events (login/logout).
    // This eliminates the race condition.

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        // 1. Set loading to true every time auth state changes.
        //    This shows the loader during login/logout.
        setLoading(true);
        
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            // If there's a user, fetch their profile
            await fetchUserProfile(session.user);
          } else {
            // User logged out
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("Error in onAuthStateChange handler: ", e);
        } finally {
          // 2. THIS IS THE CRITICAL PART.
          //    We MUST set loading to false after all work is done,
          //    no matter what. This unlocks the app.
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
      {/* (This fix from before is also still correct) */}
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