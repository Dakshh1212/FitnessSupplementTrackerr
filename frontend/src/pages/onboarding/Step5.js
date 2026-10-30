
import { useState } from "react";

const options = [
  {
    key: "veg",
    icon: "🥦",
    title: "Vegetarian",
    description: "Plant-based meals with dairy and other vegetarian foods.",
  },
  {
    key: "non-veg",
    icon: "🍗",
    title: "Non-Vegetarian",
    description: "A varied diet that can include meat, fish, eggs, and dairy.",
  },
  {
    key: "vegan",
    icon: "🌱",
    title: "Vegan",
    description: "Meals made entirely from plant-based ingredients.",
  },
];

export default function Step5({ submit }) {
  const [selectedPreference, setSelectedPreference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedPreference || submitting) return;

    setSubmitting(true);

    try {
      await submit({ foodPreference: selectedPreference });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">
          🍽️
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Your food preference
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Choose the diet style that suits you best.
        </p>
      </div>

      {/* Information */}
      <div className="flex gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
        <span aria-hidden="true">✨</span>
        <p className="text-xs leading-relaxed text-gray-300">
          Your preference can help personalize meal recommendations and
          nutrition tracking.
        </p>
      </div>

      {/* Options */}
      <div
        className="space-y-3"
        role="radiogroup"
        aria-label="Food preference"
      >
        {options.map((option) => {
          const selected = selectedPreference === option.key;

          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedPreference(option.key)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#020617] ${
                selected
                  ? "border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                {option.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">
                  {option.title}
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-gray-400">
                  {option.description}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedPreference || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Saving your profile..." : "Complete setup"}
        {!submitting && <span aria-hidden="true">→</span>}
      </button>

      <p className="text-center text-xs leading-relaxed text-gray-500">
        You can update your food preference later if your needs change.
      </p>
    </form>
  );
}
