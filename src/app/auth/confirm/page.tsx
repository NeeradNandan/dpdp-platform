"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield } from "lucide-react";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      const supabase = createClient();

      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            setError(sessionError.message);
            return;
          }
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        if (codeError) {
          setError(codeError.message);
          return;
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (tokenHash && type) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "email" | "signup" | "recovery" | "email_change",
        });
        if (otpError) {
          setError(otpError.message);
          return;
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setError("Invalid confirmation link. Please try signing up again.");
    }

    handleAuth();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Verification failed</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <Shield className="h-7 w-7 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Verifying your email...</h2>
        <p className="mt-2 text-sm text-slate-600">Please wait while we confirm your account.</p>
      </div>
    </div>
  );
}
