import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { login } from "../api/auth";

export interface UserResponse {
  token: string;
  user: {
    username: string;
    role: "admin" | "shopper";
    token: string;
  };
}
interface LoginProps {
  onLoginSuccess: (userData: UserResponse) => void;
  onNavigateToRegister: () => void;
}

export default function Login({
  onLoginSuccess,
  onNavigateToRegister,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    mutation.mutate({ email, password });
  };

  const mutation = useMutation({
    mutationFn: login,
    onMutate: () => setLoading(true),
    onError: (err: any) => {
      setError(err?.response?.data?.error || err.message || "Login failed");
    },
    onSuccess: (data) => {
      console.log('data',data);
      onLoginSuccess(data);
    },
    onSettled: () => setLoading(false),
  });

  return (
    <div className="mx-auto my-16 max-w-md px-6 antialiased">
      <div className="rounded-3xl border border-white/20 bg-white/60 p-10 shadow-xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h2 className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your retail stock
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pr-4 pl-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pr-4 pl-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/10 transition-all hover:bg-sky-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            onClick={onNavigateToRegister}
            className="font-semibold text-sky-600 transition-colors hover:text-sky-500 hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
