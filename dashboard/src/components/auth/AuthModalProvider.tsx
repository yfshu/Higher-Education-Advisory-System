"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

interface AuthModalContextValue {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = useCallback(() => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  }, []);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  const closeRegister = useCallback(() => setIsRegisterOpen(false), []);

  const switchToRegister = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  }, []);

  const switchToLogin = useCallback(() => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  }, []);

  useEffect(() => {
    const body = document.body;
    const shouldLock = isLoginOpen || isRegisterOpen;
    if (shouldLock) {
      const originalOverflow = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isLoginOpen, isRegisterOpen]);

  const value = useMemo<AuthModalContextValue>(
    () => ({
      isLoginOpen,
      isRegisterOpen,
      openLogin,
      closeLogin,
      openRegister,
      closeRegister,
      switchToRegister,
      switchToLogin,
    }),
    [isLoginOpen, isRegisterOpen, openLogin, closeLogin, openRegister, closeRegister, switchToRegister, switchToLogin],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <LoginModal />
      <RegisterModal />
    </AuthModalContext.Provider>
  );
}

export function useAuthModals() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModals must be used within an AuthModalProvider");
  }
  return context;
}
