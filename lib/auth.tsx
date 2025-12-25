"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (
    emailOrPhone: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signUp: (
    name: string,
    phone: string,
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user profile from user_profiles table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);

      if (event === "SIGNED_OUT" && pathname?.startsWith("/admin")) {
        router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Sign in with email or phone
  const signIn = async (emailOrPhone: string, password: string) => {
    let email = emailOrPhone;

    // Check if input looks like a phone number (contains mostly digits)
    const isPhone = /^[+]?[\d\s-]{10,}$/.test(emailOrPhone.replace(/\s/g, ""));

    if (isPhone) {
      // Lookup email by phone number
      const { data: profileData, error: lookupError } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("phone", emailOrPhone)
        .single();

      if (lookupError || !profileData) {
        return { error: new Error("No account found with this phone number") };
      }

      email = profileData.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  // Sign up with name, phone, email, password
  const signUp = async (
    name: string,
    phone: string,
    email: string,
    password: string
  ) => {
    // First, check if phone already exists
    const { data: existingPhone } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("phone", phone)
      .single();

    if (existingPhone) {
      return { error: new Error("This phone number is already registered") };
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return { error: new Error("This email is already registered") };
    }

    // Create auth user with metadata
    // The user profile will be created by a database trigger on auth.users insert
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : undefined,
      },
    });

    if (authError) {
      return { error: authError as Error };
    }

    // If user was created and we have an active session, create the profile
    // This handles the case where email confirmation is disabled
    if (authData.user && authData.session) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: authData.user.id,
            name,
            phone,
            email,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail signup if profile creation fails - user can update later
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    // Redirect admin users to admin login, regular users to home
    if (pathname?.startsWith("/admin")) {
      router.push("/admin/login");
    } else {
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, userProfile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
