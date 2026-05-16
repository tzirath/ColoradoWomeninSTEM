"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/join" || searchParams.get("join") === "true") setOpen(true);
  }, [pathname, searchParams]);

  return (
    <JoinModalContext.Provider
      value={{ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }}
    >
      {children}
    </JoinModalContext.Provider>
  );
}

export const useJoinModal = () => useContext(JoinModalContext);
