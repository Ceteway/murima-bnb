import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Assuming supabase client is exported from lib/supabase.ts
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabaseClient = supabase;
      if (!supabaseClient) {
        console.warn('Supabase client not initialized. Please check your environment variables.');
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    fetchUser();

    // Listen for authentication changes
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
        setIsLoading(false); // Ensure loading is false after auth state change
      });
      authListener = { subscription: data.subscription };
    }

    return () => {
      // Clean up the listener when the component unmounts
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // User state will be updated by the onAuthStateChange listener
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    // User state will be updated by the onAuthStateChange listener
    setIsLoading(false);
  };

  const logout = async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null); // Explicitly set user to null on logout
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
