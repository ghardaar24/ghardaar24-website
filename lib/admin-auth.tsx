"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export interface AdminProfile {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch admin profile from admins table
  const fetchAdminProfile = async (userId: string) => {
    // Prevent concurrent fetch calls
    if (isFetching) {
      return null;
    }

    setIsFetching(true);
    try {
      // Use maybeSingle() to avoid errors when no admin record exists
      const { data, error } = await supabaseAdmin
        .from("admins")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        // 406 errors typically mean RLS policy blocked access or content negotiation failed
        // This is expected for non-admin users or when session is invalid
        if (error.message?.includes("406") || error.code === "PGRST116") {
          console.log("User is not an admin or session invalid");
        } else {
          console.error("Admin profile fetch error:", error);
        }
        setAdminProfile(null);
        return false;
      }

      if (data) {
        setAdminProfile(data);
        return true;
      } else {
        // No admin record found for this user
        setAdminProfile(null);
        return false;
      }
    } catch (err) {
      console.error("Admin profile fetch exception:", err);
      setAdminProfile(null);
      return false;
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseAdmin.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Only fetch admin profile if we have a valid session with access token
        if (session?.user && session.access_token) {
          await fetchAdminProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting admin session:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabaseAdmin.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // Skip INITIAL_SESSION as getSession already handles it
      if (event === "INITIAL_SESSION") {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && session.access_token) {
        await fetchAdminProfile(session.user.id);
      } else {
        setAdminProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error as Error };
      }

      // Verify user is an admin
      if (data.user) {
        const isAdmin = await fetchAdminProfile(data.user.id);
        if (!isAdmin) {
          // Sign out if not an admin
          await supabaseAdmin.auth.signOut();
          return {
            error: new Error("This account is not authorized as an admin."),
          };
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Admin sign in error:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabaseAdmin.auth.signOut();
    setAdminProfile(null);
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
