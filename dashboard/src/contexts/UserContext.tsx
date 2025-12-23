"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface StudentProfile {
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

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        setUserDataState(JSON.parse(storedData));
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

  const logout = () => {
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

