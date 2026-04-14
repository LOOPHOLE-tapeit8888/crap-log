"use client";

import { useState, useEffect } from "react";
import {
  TrainFront,
  LogIn,
  UserPlus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "../../lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type AuthMode = "login" | "register";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Pick up error from callback redirect (?error=auth_callback_failed)
  useEffect(() => {
    const callbackError = searchParams.get("error");
    if (callbackError === "auth_callback_failed") {
      setError("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  /* ── Google OAuth ── */
  const handleGoogleLogin = async () => {
    setError(null);
    setMessage(null);
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // If no error, the browser will redirect to Google — no need to setLoading(false)
  };

  /* ── Email/Password Auth ── */
  const handleAuth = async () => {
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
          if (authError.message.toLowerCase().includes("email not confirmed")) {
            setError(
              "Your email is not verified yet. Check your inbox (and spam folder) for the confirmation link."
            );
          } else {
            setError(authError.message);
          }
          return;
        }

        if (data.session) {
          router.push("/dashboard");
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data.user?.identities?.length === 0) {
          setError(
            "An account with this email already exists. Switch to Login."
          );
          return;
        }

        if (data.session) {
          router.push("/dashboard");
        } else {
          setMessage(
            "Account created! A verification link has been sent to " +
              email +
              ". Check your inbox (and spam), click the link, then Login."
          );
          setMode("login");
        }
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-0 shadow-2xl">
      {/* ═══ YELLOW HEADER ═══ */}
      <div className="bg-[#FFD100] relative overflow-hidden rounded-t-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-16 top-[80px] bottom-0">
            <div className="absolute inset-0 border-t-[28px] border-r-[28px] border-[#009EDB] rounded-tr-[60px]" />
            <div className="absolute top-[28px] right-[28px] left-0 bottom-0 border-t-[28px] border-r-[28px] border-[#F47321] rounded-tr-[32px]" />
          </div>
        </div>
        <div className="relative z-10 px-8 pt-8 pb-10 sm:px-10 sm:pt-10 sm:pb-14">
          <div className="flex items-start justify-between">
            <h1 className="text-5xl sm:text-6xl font-black text-black tracking-[-0.06em] leading-none">
              crap_log
            </h1>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center shrink-0 shadow-[0_0_0_4px_#FFD100]">
              <TrainFront className="text-white w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BLACK FORM PANEL ═══ */}
      <div className="bg-black border-t-[8px] border-white px-6 py-8 sm:px-10 sm:py-10">
        {/* ── Google OAuth Button ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 mb-6
                     bg-white text-black font-extrabold text-lg sm:text-xl uppercase tracking-wider
                     border-[4px] border-white
                     hover:bg-[#FFD100] hover:border-[#FFD100] transition-colors
                     disabled:opacity-50 shadow-[0_4px_0_rgba(255,255,255,0.3)]
                     active:translate-y-[2px] active:shadow-none"
        >
          {googleLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              {/* Google "G" icon */}
              <svg viewBox="0 0 24 24" width="24" height="24" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[3px] bg-neutral-700" />
          <span className="text-neutral-500 font-extrabold text-sm uppercase tracking-widest">
            Or
          </span>
          <div className="flex-1 h-[3px] bg-neutral-700" />
        </div>

        {/* ── Mode Toggle ── */}
        <div className="flex bg-neutral-900 border-[4px] border-neutral-700 mb-8">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 font-extrabold text-lg sm:text-xl uppercase tracking-wider transition-colors ${
              mode === "login"
                ? "bg-[#FFD100] text-black"
                : "bg-transparent text-neutral-500 hover:text-white"
            }`}
          >
            <LogIn size={20} strokeWidth={3} />
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 font-extrabold text-lg sm:text-xl uppercase tracking-wider transition-colors ${
              mode === "register"
                ? "bg-[#FFD100] text-black"
                : "bg-transparent text-neutral-500 hover:text-white"
            }`}
          >
            <UserPlus size={20} strokeWidth={3} />
            Register
          </button>
        </div>

        {/* ── Feedback Messages ── */}
        {error && (
          <div className="bg-[#EE352E]/15 border-l-[6px] border-[#EE352E] text-[#EE352E] font-bold p-4 mb-6 text-sm sm:text-base flex items-start gap-3">
            <AlertTriangle size={22} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-[#00933C]/15 border-l-[6px] border-[#00933C] text-[#00933C] font-bold p-4 mb-6 text-sm sm:text-base flex items-start gap-3">
            <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* ── Email / Password Form ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block text-neutral-400 font-bold text-sm uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-[4px] border-neutral-600 bg-neutral-900 text-white px-4 py-3 sm:py-4 text-lg sm:text-xl font-bold placeholder:text-neutral-600 focus:outline-none focus:border-[#FFD100] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-bold text-sm uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-[4px] border-neutral-600 bg-neutral-900 text-white px-4 py-3 sm:py-4 text-lg sm:text-xl font-bold placeholder:text-neutral-600 focus:outline-none focus:border-[#FFD100] transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 bg-[#FFD100] text-black font-extrabold text-xl sm:text-2xl py-4 sm:py-5 uppercase tracking-wider flex items-center justify-center gap-3 border-[4px] border-[#FFD100] hover:bg-white hover:border-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn size={24} strokeWidth={3} />
                Login
              </>
            ) : (
              <>
                <UserPlus size={24} strokeWidth={3} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-neutral-500 text-sm font-bold mt-6 text-center uppercase tracking-wider">
          {mode === "login"
            ? "Don't have an account? Switch to Register ↑"
            : "After registering, verify your email, then Login."}
        </p>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="bg-[#FFD100] text-black font-extrabold text-sm sm:text-lg px-6 sm:px-10 py-3 flex items-center justify-between uppercase tracking-widest rounded-b-2xl border-t-[4px] border-black">
        <span className="tracking-[0.3em]">{"<<<<<<<< "}</span>
        <span>Insert This Way</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 sm:p-8 selection:bg-[#FFD100] selection:text-black"
      style={{
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <Suspense
        fallback={
          <div className="text-white text-xl font-bold uppercase tracking-widest">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
