"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Image src="/cws-logo.png" alt="CWS" width={56} height={56} />
        </div>
        <h1 className="font-body text-2xl font-bold text-foreground mb-1">Admin Access</h1>
        <p className="font-body text-sm text-foreground/60 mb-8">
          Sign in with an authorized Google account to manage site content.
        </p>

        {error === "unauthorized" && (
          <p className="font-body text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 mb-6">
            Your Google account is not authorized. Contact Tzirath to request access.
          </p>
        )}
        {error === "auth_failed" && (
          <p className="font-body text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 mb-6">
            Authentication failed. Please try again.
          </p>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-lg px-5 py-3 font-body text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="font-body text-xs text-foreground/40 mt-6">
          Access is restricted to authorized CWS team members only.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
