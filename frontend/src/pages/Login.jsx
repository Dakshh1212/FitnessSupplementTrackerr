
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({ email, password });
      const result = response?.data ?? response;
      const token = result?.token;
      const user = result?.user;

      if (!token || typeof token !== "string" || !user || !user.id) {
        throw new Error("The server returned an invalid login response.");
      }

      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error(
          "Unable to save your session. Please check your browser settings."
        );
      }

      navigate(
        user.isOnboardingComplete ? "/dashboard" : "/onboarding",
        { replace: true }
      );
    } catch (err) {
      console.error(
        "Login failed:",
        err?.response?.data?.message || err.message
      );

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d19] px-4 py-10 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-2xl">
            🏋️
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Fitness Supplement Tracker
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back 👋
          </h1>

          <p className="text-sm text-gray-400">
            Log in to continue your fitness journey.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email address
            </label>

            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              maxLength={254}
              required
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                maxLength={72}
                required
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login 🚀"}
          </button>
        </form>

        <div className="border-t border-white/10 pt-5 text-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
