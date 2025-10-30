// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'discord') => Promise<void>;
  signOut: (options?: { scope: 'global' | 'local' }) => Promise<{ error: AuthError | null }>; // **FIX: Updated type**
  updateUser: (credentials: { email?: string; password?: string; data?: any; }) => Promise<{ user: User | null; error: AuthError | null; }>;
  reauthenticate: (password: string) => Promise<{ error: AuthError | null; }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = async (provider: 'google' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  // **FIX: Modified signOut to accept scope**
  const signOut = async (options?: { scope: 'global' | 'local' }) => {
    const { error } = await supabase.auth.signOut(options); // Pass options to supabase
    setUser(null);
    setSession(null);
    return { error };
  };

  const updateUser = async (credentials: { email?: string; password?: string; data?: any; }) => {
    const { data, error } = await supabase.auth.updateUser(credentials);
    return { user: data.user, error };
  };
  
  const reauthenticate = async (password: string) => {
      const { error } = await supabase.auth.reauthenticate({
          type: 'password',
          email: user?.email, // Assumes email is available
          password,
      });
      return { error };
  };
  
  const updatePassword = async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
  };

  const value = {
    user,
    session,
    loading,
    signInWithProvider,
    signOut,
    updateUser,
    reauthenticate,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};