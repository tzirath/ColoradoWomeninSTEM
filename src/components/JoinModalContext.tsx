"use client";

import { createContext, useContext, useState } from "react";

interface JoinModalContextValue {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const JoinModalContext = createContext<JoinModalContextValue>({
  open: false,
  openModal: () => {},
  closeModal: () => {},
});

export function JoinModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <JoinModalContext.Provider
      value={{ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }}
    >
      {children}
    </JoinModalContext.Provider>
  );
}

export const useJoinModal = () => useContext(JoinModalContext);
