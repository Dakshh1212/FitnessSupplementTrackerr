
import { useState } from "react";

const levels = [
  {
    key: "sedentary",
    icon: "🪑",
    title: "Sedentary",
    description: "Mostly sitting, with little or no planned exercise.",
    color: "from-slate-500/15 to-gray-500/5",
  },
  {
    key: "lightly_active",
    icon: "🚶",
    title: "Lightly Active",
    description: "Light exercise or walking on some days.",
    color: "from-sky-500/15 to-blue-500/5",
  },
  {
    key: "moderately_active",
    icon: "🏋️",
    title: "Moderately Active",
    description: "Moderate exercise around 3–5 days per week.",
    color: "from-blue-500/15 to-cyan-500/5",
  },
  {
    key: "very_active",
    icon: "🏃",
    title: "Very Active",
    description: "Intense exercise or physically demanding activity most days.",
    color: "from-emerald-500/15 to-teal-500/5",
  },
];

export default function Step4({ next }) {
  const [selectedLevel, setSelectedLevel] = useState("");

  const handleContinue = (event) => {
    event.preventDefault();

    if (!selectedLevel) return;

    next({ activityLevel: selectedLevel });
  };

  return (
    <form
      onSubmit={handleContinue}
      className="mx-auto w-full max-w-md space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">
          ⚡
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Your activity level
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Choose the option that best reflects your typical week.
        </p>
      </div>

      {/* Options */}
      <div
        className="space-y-3"
        role="radiogroup"
        aria-label="Daily activity level"
      >
        {levels.map((level) => {
          const selected = selectedLevel === level.key;

          return (
            <button
              key={level.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedLevel(level.key)}
              className={`flex w-full items-center gap-4 rounded-2xl border bg-gradient-to-r ${level.color} p-4 text-left transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#020617] ${
                selected
                  ? "border-emerald-400 ring-1 ring-emerald-400/40"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                {level.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">
                  {level.title}
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-gray-400">
                  {level.description}
                </span>
              </span>

              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                  selected
                    ? "border-emerald-400 bg-emerald-400 text-gray-950"
                    : "border-gray-500 text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>

      {/* Continue */}
      <button
        type="submit"
        disabled={!selectedLevel}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
        <span aria-hidden="true">→</span>
      </button>

      <p className="text-center text-xs leading-relaxed text-gray-500">
        An accurate activity estimate helps personalize your calorie target.
      </p>
    </form>
  );
}
