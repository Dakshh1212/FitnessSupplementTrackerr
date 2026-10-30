
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const DEFAULT_PROFILE = {
  name: "",
  age: "",
  height: "",
  weight: "",
  gender: "male",
  activityLevel: "sedentary",
  goal: "maintenance",
  photo: "",
};

const FALLBACK_AVATAR =
  "https://placehold.co/160x160/111827/9ca3af?text=Profile";

export default function Profile() {
  const [user, setUser] = useState(DEFAULT_PROFILE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        setError("");

        const response = await API.get("/auth/me");
        const profile = response?.data?.user;

        if (!profile) {
          throw new Error("The server did not return your profile.");
        }

        if (active) {
          setUser({
            ...DEFAULT_PROFILE,
            ...profile,
            age: profile.age ?? "",
            height: profile.height ?? "",
            weight: profile.weight ?? "",
            photo: profile.photo || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Unable to load your profile."
          );
        }
      } finally {
        if (active) setInitialLoading(false);
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setUser((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
    setNotice("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving || initialLoading) return;

    const name = String(user.name || "").trim();
    const age = user.age === "" ? null : Number(user.age);
    const height = user.height === "" ? null : Number(user.height);
    const weight = user.weight === "" ? null : Number(user.weight);

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (age !== null && (!Number.isInteger(age) || age < 13 || age > 120)) {
      setError("Age must be a whole number between 13 and 120.");
      return;
    }

    if (height !== null && (!Number.isFinite(height) || height < 50 || height > 250)) {
      setError("Height must be between 50 and 250 cm.");
      return;
    }

    if (weight !== null && (!Number.isFinite(weight) || weight < 20 || weight > 400)) {
      setError("Weight must be between 20 and 400 kg.");
      return;
    }

    const payload = {
      name,
      age,
      height,
      weight,
      gender: user.gender || "male",
      activityLevel: user.activityLevel || "sedentary",
      goal: user.goal || "maintenance",
      photo: user.photo || "",
    };

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const response = await API.put("/auth/update", payload);
      const updatedUser = response?.data?.user;

      if (updatedUser) {
        setUser((previous) => ({
          ...previous,
          ...updatedUser,
        }));

        // Keep the locally cached user in sync if it exists.
        try {
          const cachedUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );

          localStorage.setItem(
            "user",
            JSON.stringify({ ...cachedUser, ...updatedUser })
          );
        } catch {
          // The API update can succeed even if the cache is unavailable.
        }
      } else {
        setUser((previous) => ({ ...previous, ...payload }));
      }

      setNotice("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after an upload attempt.
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your profile image must be smaller than 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      setError("");
      setNotice("");

      const response = await API.post("/upload", formData);
      const imageUrl = response?.data?.imageUrl;

      if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("The server did not return an image URL.");
      }

      handleChange("photo", imageUrl);
      setNotice("Image uploaded. Save your profile to keep the change.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      <Sidebar />

      <div className="min-h-screen lg:ml-64">
        <Navbar />

        <main className="mx-auto max-w-4xl space-y-6 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          <header>
            <p className="text-sm font-medium text-blue-400">
              ACCOUNT SETTINGS
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Your Profile 👤
            </h1>

            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              Keep your personal details and fitness goals up to date.
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

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
            >
              {notice}
            </div>
          )}

          {initialLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
              Loading your profile...
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8"
            >
              <section className="flex flex-col items-center gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-center">
                <img
                  src={user.photo || FALLBACK_AVATAR}
                  alt="Profile avatar"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_AVATAR;
                  }}
                  className="h-24 w-24 rounded-full border-2 border-emerald-400/50 bg-black/20 object-cover"
                />

                <div className="text-center sm:text-left">
                  <h2 className="font-semibold">
                    {user.name || "Your account"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Upload a profile picture (maximum 5 MB).
                  </p>

                  <label className="mt-3 inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
                    {uploading ? "Uploading..." : "Choose image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoUpload}
                      disabled={uploading || saving}
                      className="sr-only"
                    />
                  </label>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">
                  Personal information
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-gray-300">
                    Full name
                    <input
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      type="text"
                      value={user.name || ""}
                      onChange={(event) =>
                        handleChange("name", event.target.value)
                      }
                      maxLength={100}
                      required
                      disabled={saving}
                    />
                  </label>

                  <label className="block text-sm text-gray-300">
                    Age
                    <input
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      type="number"
                      min="13"
                      max="120"
                      step="1"
                      value={user.age}
                      onChange={(event) =>
                        handleChange("age", event.target.value)
                      }
                      disabled={saving}
                    />
                  </label>

                  <label className="block text-sm text-gray-300">
                    Height (cm)
                    <input
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      type="number"
                      min="50"
                      max="250"
                      step="0.1"
                      value={user.height}
                      onChange={(event) =>
                        handleChange("height", event.target.value)
                      }
                      disabled={saving}
                    />
                  </label>

                  <label className="block text-sm text-gray-300">
                    Weight (kg)
                    <input
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      type="number"
                      min="20"
                      max="400"
                      step="0.1"
                      value={user.weight}
                      onChange={(event) =>
                        handleChange("weight", event.target.value)
                      }
                      disabled={saving}
                    />
                  </label>

                  <label className="block text-sm text-gray-300">
                    Gender
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      value={user.gender || "male"}
                      onChange={(event) =>
                        handleChange("gender", event.target.value)
                      }
                      disabled={saving}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="border-t border-white/10 pt-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Fitness preferences
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-gray-300">
                    Activity level
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      value={user.activityLevel || "sedentary"}
                      onChange={(event) =>
                        handleChange("activityLevel", event.target.value)
                      }
                      disabled={saving}
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="lightly_active">Lightly active</option>
                      <option value="moderately_active">
                        Moderately active
                      </option>
                      <option value="very_active">Very active</option>
                    </select>
                  </label>

                  <label className="block text-sm text-gray-300">
                    Fitness goal
                    <select
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-emerald-400/60"
                      value={user.goal || "maintenance"}
                      onChange={(event) =>
                        handleChange("goal", event.target.value)
                      }
                      disabled={saving}
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="fat_loss">Fat loss</option>
                      <option value="muscle_gain">Muscle gain</option>
                    </select>
                  </label>
                </div>
              </section>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving profile..." : "Save profile"}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
