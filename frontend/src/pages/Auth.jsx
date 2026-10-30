
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginUser,
  registerUser,
} from "../services/authService";

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleModeChange = () => {
    setIsLogin((previous) => !previous);
    setShowPassword(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isLogin && (password.length < 8 || password.length > 72)) {
      setError("Your password must be between 8 and 72 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = isLogin
        ? await loginUser({ email, password })
        : await registerUser({ name, email, password });

      // Support an Axios response or a direct authentication object.
      const result = response?.data ?? response;
      const token = result?.token;
      const user = result?.user;

      if (
        typeof token !== "string" ||
        !token ||
        !user ||
        user.id == null
      ) {
        throw new Error(
          "The server returned an invalid authentication response."
        );
      }

      // Save authentication information.
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        throw new Error(
          "Unable to save your login session. Please check your browser settings."
        );
      }

      // Notify App.js that authentication information has changed.
      window.dispatchEvent(new Event("authChanged"));

      // Support boolean and numeric onboarding flags.
      const onboardingComplete =
        user.isOnboardingComplete === true ||
        Number(user.isOnboardingComplete) === 1;

      // Navigate immediately after successful login or registration.
      navigate(
        onboardingComplete ? "/dashboard" : "/onboarding",
        { replace: true }
      );
    } catch (err) {
      console.error(
        "Authentication failed:",
        err?.response?.data?.message || err.message
      );

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d19] px-4 py-10 text-white">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl sm:h-96 sm:w-96"
      />

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        {/* Brand */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">
            🏋️
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Your fitness companion
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            {isLogin
              ? "Sign in to continue your fitness journey."
              : "Build healthier habits, one day at a time."}
          </p>
        </header>

        {/* Form error */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label
                htmlFor="auth-name"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Full name
              </label>

              <input
                id="auth-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                maxLength={100}
                required
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email address
            </label>

            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              maxLength={254}
              required
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  isLogin ? "current-password" : "new-password"
                }
                value={form.password}
                onChange={handleChange}
                placeholder={
                  isLogin
                    ? "Enter your password"
                    : "At least 8 characters"
                }
                minLength={isLogin ? undefined : 8}
                maxLength={72}
                required
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-emerald-950/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}

            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        {/* Login / signup toggle */}
        <div className="mt-7 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLogin
              ? "New to FitnessSupplementTrackerr?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={handleModeChange}
              disabled={loading}
              className="ml-2 font-semibold text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Track your nutrition. Train consistently. Measure your progress.
        </p>
      </section>
    </main>
  );
}
