"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";

interface AIAssistantState {
  isOpen: boolean;
}

interface AIAssistantDispatch {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const AIAssistantStateContext = createContext<AIAssistantState | null>(null);
const AIAssistantDispatchContext = createContext<AIAssistantDispatch | null>(null);

const STORAGE_KEY = "reos-ai-panel-open";

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <AIAssistantStateContext.Provider value={{ isOpen }}>
      <AIAssistantDispatchContext.Provider value={{ open, close, toggle }}>
        {children}
      </AIAssistantDispatchContext.Provider>
    </AIAssistantStateContext.Provider>
  );
}

export function useAIAssistant() {
  const state = useContext(AIAssistantStateContext);
  const dispatch = useContext(AIAssistantDispatchContext);
  if (!state || !dispatch) {
    throw new Error("useAIAssistant must be used within AIAssistantProvider");
  }
  return { ...state, ...dispatch };
}
