"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthLoading } = authClient.useSession();

  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [timeString, setTimeString] = useState<string>("");

  // If session exists, push to workspace dashboard instantly
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Live Clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeString(
        now
          .toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
          .toUpperCase()
      );
    };
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (isSignUp) {
      await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      }, {
        onError: ({ error }) => setAuthError(error.message || "Registration sequence failed"),
      });
    } else {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      }, {
        onError: ({ error }) => setAuthError(error.message || "Invalid operator credentials"),
      });
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-mono text-xs tracking-widest uppercase animate-pulse">
        Initializing Secure Context...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      {/* Live clock */}
      {timeString && (
        <div className="absolute top-6 right-6 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-md shadow-md text-right hidden sm:block">
          <p className="text-xs font-mono font-bold tracking-tight text-neutral-300">{timeString}</p>
        </div>
      )}

      {/* Login box */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold font-mono tracking-tight mb-2 text-center uppercase">
          TODO APP
        </h1>
        <p className="text-neutral-500 font-mono text-xs text-center mb-6">
          {isSignUp ? "Register here" : "Login here"}
        </p>

        <form onSubmit={handleCredentialsAuth} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NAME"
              className="w-full bg-neutral-950 border border-neutral-700 px-4 py-2 rounded focus:outline-none focus:border-white font-mono text-sm uppercase placeholder:text-neutral-600 text-white"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="EMAIL ADDRESS"
            className="w-full bg-neutral-950 border border-neutral-700 px-4 py-2 rounded focus:outline-none focus:border-white font-mono text-sm placeholder:text-neutral-600 text-white"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="w-full bg-neutral-950 border border-neutral-700 px-4 py-2 rounded focus:outline-none focus:border-white font-mono text-sm placeholder:text-neutral-600 text-white"
          />

          {authError && (
            <p className="text-red-400 font-mono text-xs bg-red-950/20 border border-red-950 p-2 rounded text-center">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-white text-black py-2 rounded text-sm font-bold font-mono tracking-wider uppercase hover:bg-neutral-200 transition-colors disabled:bg-neutral-600"
          >
            {authLoading ? "Processing..." : isSignUp ? "Register" : "Login"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-900 px-2 font-mono text-neutral-500">OR</span></div>
        </div>

        <div className="w-full">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 py-2 px-4 rounded text-xs font-mono tracking-tight hover:border-neutral-500 transition-colors uppercase flex items-center justify-center gap-2"
          >
            CONTINUE WITH Google
          </button>
        </div>

        <p className="text-center font-mono text-xs text-neutral-400 mt-6">
          {isSignUp ? "Already have a account?" : "New to TODO APP?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}
            className="text-white underline font-bold"
          >
            {isSignUp ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </main>
  );
}