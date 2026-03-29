"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { JoinModalProvider, useJoinModal } from "@/components/JoinModalContext";
import JoinModal from "@/components/JoinModal";
import Navbar from "@/components/Navbar";
import SignupBanner from "@/components/SignupBanner";
import Footer from "@/components/Footer";

function SiteShell({ children }: { children: React.ReactNode }) {
  const { open, openModal, closeModal } = useJoinModal();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar onJoinClick={openModal} />
      <main>{children}</main>
      <Footer />
      <JoinModal open={open} onClose={closeModal} />
      <SignupBanner onJoinClick={openModal} />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <JoinModalProvider>
            <SiteShell>{children}</SiteShell>
          </JoinModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleReCaptchaProvider>
  );
}
