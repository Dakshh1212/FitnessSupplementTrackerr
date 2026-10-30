
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
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

  const nextStep = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (name.length > 100) {
      setError("Your name must be 100 characters or fewer.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    setForm((previous) => ({ ...previous, name, email }));
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Support either an Axios response or a service returning response.data.
      const result = response?.data ?? response;
      const token = result?.token;
      const user = result?.user;

      if (!token || typeof token !== "string" || !user || !user.id) {
        throw new Error("The server returned an invalid signup response.");
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
        "Signup failed:",
        err?.response?.data?.message || err.message
      );

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to create your account. Please try again."
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
            Create your account
          </h1>

          <p className="text-sm text-gray-400">
            Start building healthier habits today.
          </p>
        </header>

        <div
          className="h-2 overflow-hidden rounded-full bg-black/30"
          role="progressbar"
          aria-label="Signup progress"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={step}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span className={step === 1 ? "text-blue-400" : "text-gray-300"}>
            1. Your details
          </span>
          <span className={step === 2 ? "text-blue-400" : "text-gray-500"}>
            2. Confirmation
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={nextStep} className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Full name
              <input
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                maxLength={100}
                required
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400/60"
              />
            </label>

            <label className="block text-sm font-medium text-gray-300">
              Email address
              <input
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400/60"
              />
            </label>

            <label className="block text-sm font-medium text-gray-300">
              Password
              <div className="relative mt-2">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  minLength={8}
                  maxLength={72}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-20 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400/60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3.5 font-semibold transition hover:brightness-110 disabled:opacity-50"
            >
              Continue →
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <h2 className="font-semibold">Ready to start? 💪</h2>
              <p className="mt-2 text-sm text-gray-400">
                Your account will be created with the details below.
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <p className="break-words text-gray-300">
                  <span className="text-gray-500">Name:</span>{" "}
                  {form.name}
                </p>
                <p className="break-words text-gray-300">
                  <span className="text-gray-500">Email:</span>{" "}
                  {form.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 font-medium transition hover:bg-white/10 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account 🚀"}
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-5 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
