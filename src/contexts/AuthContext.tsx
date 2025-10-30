// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, SignOutOptions, UserAttributes } from '@supabase/supabase-js';

// **NEW: Define the Profile type based on your schema**
interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_admin: boolean;
  // ... any other fields from your 'profiles' table
}

// **MODIFIED: Update the AuthContextType to include profile data**
interface AuthContextType {
  user: User | null;
  profile: Profile | null; // <-- ADDED
  loading: boolean;
  isAdmin: boolean; // <-- ADDED
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<any>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<any>;
  signOut: (options?: SignOutOptions) => Promise<any>;
  updateUser: (credentials: UserAttributes) => Promise<any>;
  reauthenticate: (password: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
  fetchProfile: () => Promise<void>; // <-- ADDED
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // <-- ADDED
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // <-- ADDED

  // **Function to load profile data**
  // This is now just a helper function, defined once.
  const loadProfileForUser = useCallback(async (authedUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authedUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        throw error;
      }

      if (data) {
        setProfile(data);
        setIsAdmin(data.is_admin || false);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setIsAdmin(false);
    }
  }, []);

  // **Exportable function to refresh the profile**
  const fetchProfile = useCallback(async () => {
    if (user) {
      await loadProfileForUser(user);
    }
  }, [user, loadProfileForUser]);

  // =================================================================
  // **THE NEW REWRITE (FIX)**
  // We now use two separate useEffects to decouple auth from profile.
  // =================================================================

  // **EFFECT 1: Handle Auth State & Loading**
  // This hook's *only* job is to find out who the user is
  // and set loading to false. It does NOT fetch the profile.
  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); // This is the most important part!
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // <-- Empty array means this runs only ONCE.

  // **EFFECT 2: Handle Profile Fetching**
  // This hook *reacts* to changes in the `user` state.
  // It only runs *after* Effect 1 has set the user and stopped loading.
  useEffect(() => {
    if (user) {
      loadProfileForUser(user);
    } else {
      // Clear profile if user logs out
      setProfile(null);
      setIsAdmin(false);
    }
  }, [user, loadProfileForUser]); // <-- Runs whenever `user` changes.

  // =================================================================
  // **END OF REWRITE**
  // =================================================================

  // --- Your existing auth functions ---
  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    return supabase.auth.signInWithPassword(credentials);
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    return supabase.auth.signUp(credentials);
  };

  const signOut = async (options?: SignOutOptions) => {
    return supabase.auth.signOut(options);
  };

  const updateUser = async (credentials: UserAttributes) => {
    return supabase.auth.updateUser(credentials);
  };

  const reauthenticate = async (password: string) => {
    return supabase.auth.reauthenticate({ password });
  };
  
  const updatePassword = async (password: string) => {
    return supabase.auth.updateUser({ password });
  };
  // --- End of existing auth functions ---

  // **MODIFIED: Add the new profile data and fetcher to the context value**
  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateUser,
    reauthenticate,
    updatePassword,
    fetchProfile, // <-- ADDED
  };

  // The provider should ALWAYS render its children.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};