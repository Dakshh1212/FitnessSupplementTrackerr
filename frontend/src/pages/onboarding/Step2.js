
import { useState } from "react";

export default function Step2({ next }) {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const handleNext = (event) => {
    event.preventDefault();

    const parsedAge = Number(age);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);

    if (!age.trim() || !height.trim() || !weight.trim()) {
      setError("Please enter your age, height, and weight.");
      return;
    }

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 13 ||
      parsedAge > 120
    ) {
      setError("Age must be a whole number between 13 and 120.");
      return;
    }

    if (
      !Number.isFinite(parsedHeight) ||
      parsedHeight < 50 ||
      parsedHeight > 260
    ) {
      setError("Enter a height between 50 and 260 cm.");
      return;
    }

    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight < 20 ||
      parsedWeight > 500
    ) {
      setError("Enter a weight between 20 and 500 kg.");
      return;
    }

    setError("");

    next({
      age: parsedAge,
      height: parsedHeight,
      weight: parsedWeight,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleNext} className="space-y-6">
        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">
            💪
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Body statistics
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Let's establish your starting point.
          </p>
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="mb-2 block text-sm font-medium text-gray-200"
          >
            Age <span className="text-gray-400">(years)</span>
          </label>

          <input
            id="age"
            name="age"
            type="number"
            inputMode="numeric"
            min="13"
            max="120"
            step="1"
            value={age}
            onChange={(event) => {
              setAge(event.target.value);
              setError("");
            }}
            placeholder="e.g. 20"
            autoComplete="off"
            required
            className={inputClass}
          />
        </div>

        {/* Height */}
        <div>
          <label
            htmlFor="height"
            className="mb-2 block text-sm font-medium text-gray-200"
          >
            Height <span className="text-gray-400">(cm)</span>
          </label>

          <input
            id="height"
            name="height"
            type="number"
            inputMode="decimal"
            min="50"
            max="260"
            step="0.1"
            value={height}
            onChange={(event) => {
              setHeight(event.target.value);
              setError("");
            }}
            placeholder="e.g. 175"
            autoComplete="off"
            required
            className={inputClass}
          />
        </div>

        {/* Weight */}
        <div>
          <label
            htmlFor="weight"
            className="mb-2 block text-sm font-medium text-gray-200"
          >
            Weight <span className="text-gray-400">(kg)</span>
          </label>

          <input
            id="weight"
            name="weight"
            type="number"
            inputMode="decimal"
            min="20"
            max="500"
            step="0.1"
            value={weight}
            onChange={(event) => {
              setWeight(event.target.value);
              setError("");
            }}
            placeholder="e.g. 70"
            autoComplete="off"
            required
            className={inputClass}
          />
        </div>

        {/* Information */}
        <div className="flex gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
          <span className="text-lg" aria-hidden="true">
            📊
          </span>

          <p className="text-xs leading-relaxed text-gray-300">
            Your age and measurements help personalize your calorie
            estimates, nutrition targets, and fitness experience.
          </p>
        </div>

        {/* Validation */}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {/* Continue */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-950/20 transition hover:brightness-110 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#020617]"
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  );
}
