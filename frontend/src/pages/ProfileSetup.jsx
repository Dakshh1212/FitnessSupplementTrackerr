
import { useState } from "react";
import API from "../services/api";

const INITIAL_FORM = {
  age: "",
  weight: "",
  height: "",
  gender: "male",
  activityLevel: "moderately_active",
  goal: "fat_loss",
};

export default function ProfileSetup({ onComplete }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const age = Number(form.age);
    const weight = Number(form.weight);
    const height = Number(form.height);

    if (!form.age || !form.weight || !form.height) {
      setError("Please enter your age, weight, and height.");
      return;
    }

    if (!Number.isInteger(age) || age < 13 || age > 120) {
      setError("Age must be a whole number between 13 and 120.");
      return;
    }

    if (!Number.isFinite(weight) || weight < 20 || weight > 400) {
      setError("Weight must be between 20 and 400 kg.");
      return;
    }

    if (!Number.isFinite(height) || height < 50 || height > 250) {
      setError("Height must be between 50 and 250 cm.");
      return;
    }

    const payload = {
      age,
      weight,
      height,
      gender: form.gender,
      activityLevel: form.activityLevel,
      goal: form.goal,
    };

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await API.put("/users/profile", payload);
      const result = response?.data;
      const updatedUser = result?.user;

      if (updatedUser) {
        try {
          const cachedUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );

          localStorage.setItem(
            "user",
            JSON.stringify({ ...cachedUser, ...updatedUser })
          );
        } catch {
          // The server update may succeed even if the local cache fails.
        }
      } else {
        // Keep the cached profile in sync when the API returns no user object.
        try {
          const cachedUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );

          localStorage.setItem(
            "user",
            JSON.stringify({ ...cachedUser, ...payload })
          );
        } catch {
          // Do not hide a successful server response because of local storage.
        }
      }

      setSuccess("Your fitness profile has been saved.");

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not save your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-50";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d19] px-4 py-8 text-white">
      <section className="w-full max-w-lg space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-400">
            Personalise your plan
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Complete your profile 👤
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Enter your details so your calorie targets and fitness
            recommendations can be tailored to you.
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

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-300">
              Age
              <input
                type="number"
                min="13"
                max="120"
                step="1"
                required
                value={form.age}
                onChange={(event) =>
                  handleChange("age", event.target.value)
                }
                placeholder="Age in years"
                disabled={loading}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-gray-300">
              Gender
              <select
                value={form.gender}
                onChange={(event) =>
                  handleChange("gender", event.target.value)
                }
                disabled={loading}
                className={inputClass}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-300">
              Weight (kg)
              <input
                type="number"
                min="20"
                max="400"
                step="0.1"
                required
                value={form.weight}
                onChange={(event) =>
                  handleChange("weight", event.target.value)
                }
                placeholder="e.g. 75"
                disabled={loading}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-gray-300">
              Height (cm)
              <input
                type="number"
                min="50"
                max="250"
                step="0.1"
                required
                value={form.height}
                onChange={(event) =>
                  handleChange("height", event.target.value)
                }
                placeholder="e.g. 175"
                disabled={loading}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-300">
            Activity level
            <select
              value={form.activityLevel}
              onChange={(event) =>
                handleChange("activityLevel", event.target.value)
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="sedentary">
                Sedentary — little exercise
              </option>
              <option value="lightly_active">
                Lightly active — 1–3 days/week
              </option>
              <option value="moderately_active">
                Moderately active — 3–5 days/week
              </option>
              <option value="very_active">
                Very active — 6–7 days/week
              </option>
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-300">
            Fitness goal
            <select
              value={form.goal}
              onChange={(event) =>
                handleChange("goal", event.target.value)
              }
              disabled={loading}
              className={inputClass}
            >
              <option value="fat_loss">Fat loss</option>
              <option value="maintenance">Maintain weight</option>
              <option value="muscle_gain">Build muscle</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving profile..." : "Save and continue →"}
          </button>
        </form>
      </section>
    </main>
  );
}
