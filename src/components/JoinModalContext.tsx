"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === "/join" || searchParams.get("join") === "true") setOpen(true);
  }, [pathname, searchParams]);

  const openModal = () => {
    setOpen(true);
    if (typeof window !== "undefined" && window.location.pathname !== "/join") {
      prevPath.current = window.location.pathname + window.location.search;
      window.history.pushState(null, "", "/join");
    }
  };

  const closeModal = () => {
    setOpen(false);
    if (prevPath.current !== null) {
      window.history.pushState(null, "", prevPath.current);
      prevPath.current = null;
    }
  };

  return (
    <JoinModalContext.Provider value={{ open, openModal, closeModal }}>
      {children}
    </JoinModalContext.Provider>
  );
}

export const useJoinModal = () => useContext(JoinModalContext);
