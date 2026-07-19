import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type StaffRole = 'Owner' | 'Stylist';

export interface StaffProfile {
  id: string;
  name: string;
  role: StaffRole;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: StaffProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: StaffRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string, fallbackName?: string, fallbackRole?: string) => {
    const { data } = await supabase
      .from('staff_profiles')
      .select('id, name, role')
      .eq('id', userId)
      .maybeSingle();
    if (data) {
      setProfile({ id: data.id, name: data.name, role: (data.role as StaffRole) || 'Stylist' });
    } else {
      // Profile trigger may not have fired yet — fall back to auth metadata
      setProfile({
        id: userId,
        name: fallbackName || 'Staff Member',
        role: fallbackRole === 'Owner' ? 'Owner' : 'Stylist',
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfile(
          session.user.id,
          session.user.user_metadata?.name,
          session.user.user_metadata?.role,
        );
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer Supabase calls out of the auth callback to avoid deadlocks
        setTimeout(() => {
          loadProfile(
            session.user.id,
            session.user.user_metadata?.name,
            session.user.user_metadata?.role,
          );
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signUp = async (email: string, password: string, name: string, role: StaffRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
