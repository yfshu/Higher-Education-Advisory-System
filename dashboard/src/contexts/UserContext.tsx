"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "@/lib/auth/role";

interface StudentProfile {
  phoneNumber?: string;
  countryCode?: string;
  avatarUrl?: string;
  studyLevel?: string;
  extracurricular?: boolean;
  bm?: string;
  english?: string;
  history?: string;
  mathematics?: string;
  islamicEducationMoralEducation?: string;
  physics?: string;
  chemistry?: string;
  biology?: string;
  additionalMathematics?: string;
  geography?: string;
  economics?: string;
  accounting?: string;
  chinese?: string;
  tamil?: string;
  ict?: string;
  mathsInterest?: number;
  scienceInterest?: number;
  computerInterest?: number;
  writingInterest?: number;
  artInterest?: number;
  businessInterest?: number;
  socialInterest?: number;
  logicalThinking?: number;
  problemSolving?: number;
  creativity?: number;
  communication?: number;
  teamwork?: number;
  leadership?: number;
  attentionToDetail?: number;
}

interface Preferences {
  budgetRange?: string;
  preferredLocation?: string;
  preferredCountry?: string;
  studyMode?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  phoneNumber?: string;
}

interface UserData {
  user: User;
  profile?: StudentProfile;
  preferences?: Preferences;
  accessToken: string;
  refreshToken: string;
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserDataState] = useState<UserData | null>(null);

  // Sync with Supabase session and update role
  useEffect(() => {
    const syncSession = async () => {
      // Use getUser() instead of getSession() to verify token validity
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        // Get role from app_metadata
        const role = getUserRole(user);
        
        // Get current session for tokens
        const { data: { session } } = await supabase.auth.getSession();
        
        // Update userData with current role and tokens from Supabase
        setUserDataState((prev) => {
          if (prev && session) {
            return {
              ...prev,
              user: {
                ...prev.user,
                role,
                id: user.id,
                email: user.email || prev.user.email,
              },
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
            };
          }
          return prev;
        });
      } else if (error) {
        // Token is invalid, clear user data
        setUserDataState(null);
        localStorage.removeItem("userData");
      }
    };

    syncSession();

    // Listen for auth state changes
    const authStateChangeResult = supabase.auth.onAuthStateChange(async (event: string, session: unknown) => {
      // Type guard: check if session is a valid object with user property
      if (session && typeof session === 'object' && 'user' in session && session.user) {
        const sessionObj = session as { user: { app_metadata?: unknown; user_metadata?: unknown } };
        const role = getUserRole(sessionObj.user);
        setUserDataState((prev) => {
          if (prev) {
            return {
              ...prev,
              user: {
                ...prev.user,
                role,
              },
            };
          }
          return prev;
        });
      } else {
        setUserDataState(null);
      }
    });

    // Store subscription safely
    const subscription = authStateChangeResult?.data?.subscription;

    return () => {
      // Defensive cleanup: only unsubscribe if subscription exists
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing from auth state change:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUserDataState(parsed);
      } catch {
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
    if (data) {
      localStorage.setItem("userData", JSON.stringify(data));
    } else {
      localStorage.removeItem("userData");
    }
  };

  const logout = async () => {
    // Clear Supabase session
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
    // Clear local state
    setUserDataState(null);
    localStorage.removeItem("userData");
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

