"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface CompareContextType {
  selectedPrograms: number[];
  addProgram: (programId: number) => void;
  removeProgram: (programId: number) => void;
  clearCompare: () => void;
  isSelected: (programId: number) => boolean;
  canCompare: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 2;
const STORAGE_KEY = "compare_programs";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length <= MAX_COMPARE) {
            setSelectedPrograms(parsed);
          }
        } catch (e) {
          console.error("Failed to parse compare programs from localStorage", e);
        }
      }
    }
  }, []);

  // Save to localStorage whenever selectedPrograms changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPrograms));
    }
  }, [selectedPrograms]);

  const addProgram = (programId: number) => {
    setSelectedPrograms((prev) => {
      if (prev.includes(programId)) {
        // Already selected, remove it
        return prev.filter((id) => id !== programId);
      }
      if (prev.length >= MAX_COMPARE) {
        toast.warning(`You can only compare up to ${MAX_COMPARE} programs at a time.`);
        return prev;
      }
      return [...prev, programId];
    });
  };

  const removeProgram = (programId: number) => {
    setSelectedPrograms((prev) => prev.filter((id) => id !== programId));
  };

  const clearCompare = () => {
    setSelectedPrograms([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isSelected = (programId: number) => {
    return selectedPrograms.includes(programId);
  };

  const canCompare = selectedPrograms.length === MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{
        selectedPrograms,
        addProgram,
        removeProgram,
        clearCompare,
        isSelected,
        canCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}

