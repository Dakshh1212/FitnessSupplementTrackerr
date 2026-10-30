
import { useState } from "react";

const goals = [
  {
    key: "fat_loss",
    title: "Fat Loss",
    icon: "🔥",
    description: "Reduce body fat while maintaining muscle.",
    color: "from-orange-500/15 to-red-500/5",
  },
  {
    key: "muscle_gain",
    title: "Muscle Gain",
    icon: "💪",
    description: "Build strength and support muscle growth.",
    color: "from-blue-500/15 to-cyan-500/5",
  },
  {
    key: "maintenance",
    title: "Maintain Fitness",
    icon: "⚖️",
    description: "Maintain your weight and a balanced routine.",
    color: "from-emerald-500/15 to-teal-500/5",
  },
];

export default function Step3({ next }) {
  const [selectedGoal, setSelectedGoal] = useState("");

  const handleContinue = (event) => {
    event.preventDefault();

    if (!selectedGoal) return;

    next({ goal: selectedGoal });
  };

  return (
    <form
      onSubmit={handleContinue}
      className="mx-auto w-full max-w-md space-y-6"
    >
      {/* Heading */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">
          🎯
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          What's your goal?
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Choose the primary outcome you want to work toward.
        </p>
      </div>

      {/* Goal choices */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const isSelected = selectedGoal === goal.key;

          return (
            <button
              key={goal.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedGoal(goal.key)}
              className={`group flex w-full items-center gap-4 rounded-2xl border bg-gradient-to-r ${goal.color} p-4 text-left transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#020617] ${
                isSelected
                  ? "border-emerald-400 ring-1 ring-emerald-400/40"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                {goal.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">
                  {goal.title}
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-gray-400">
                  {goal.description}
                </span>
              </span>

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-400 text-gray-950"
                    : "border-gray-500 text-transparent"
                }`}
                aria-hidden="true"
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
        disabled={!selectedGoal}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
        <span aria-hidden="true">→</span>
      </button>

      <p className="text-center text-xs text-gray-500">
        You can adjust your fitness goals as your needs change.
      </p>
    </form>
  );
}
