
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { completeOnboarding } from "../../services/authService";

import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !token.trim()) {
        navigate("/", { replace: true });
      }
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const next = (values) => {
    if (submitting) return;

    setError("");
    setData((previous) => ({
      ...previous,
      ...values,
    }));

    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    if (submitting) return;

    setError("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const submit = async (values) => {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const finalData = {
        ...data,
        ...values,
      };

      await completeOnboarding(finalData);

      let oldUser = {};

      try {
        const storedUser = localStorage.getItem("user");
        oldUser = storedUser ? JSON.parse(storedUser) : {};
      } catch {
        oldUser = {};
      }

      if (
        !oldUser ||
        typeof oldUser !== "object" ||
        Array.isArray(oldUser)
      ) {
        oldUser = {};
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...finalData,
          isOnboardingComplete: true,
        })
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding submission failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "We couldn't save your profile. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617] px-4 py-8 text-white sm:px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl sm:h-96 sm:w-96"
      />

      <section className="relative z-10 w-full max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        {/* Header */}
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
            ✦
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Personalize Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Fitness Journey
            </span>
          </h1>

          <p className="text-sm text-gray-400">
            Tell us about your goals so we can personalize your experience.
          </p>

          <p className="text-xs font-medium text-gray-300">
            Step {step} of {TOTAL_STEPS}
          </p>
        </header>

        {/* Progress */}
        <div
          className="h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-4 sm:p-6">
          {step === 1 && <Step2 next={next} />}
          {step === 2 && <Step3 next={next} />}
          {step === 3 && <Step4 next={next} />}
          {step === 4 && <Step5 submit={submit} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || submitting}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Back
          </button>

          <span className="text-right text-xs text-gray-500">
            {step === TOTAL_STEPS
              ? submitting
                ? "Saving your profile..."
                : "Almost ready!"
              : "Your progress is saved as you continue"}
          </span>
        </div>

        {submitting && (
          <p role="status" className="text-center text-sm text-cyan-300">
            Saving your fitness profile…
          </p>
        )}

        <p className="text-center text-xs leading-relaxed text-gray-500">
          Your details help personalize your nutrition and workout tracking.
        </p>
      </section>
    </main>
  );
}
