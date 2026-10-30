
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-gray-100">
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : String(value)}
      </p>
    </div>
  );
}

function StatCard({ label, value, icon, description }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-emerald-400/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{label}</p>
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tabular-nums">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </article>
  );
}

export default function AdminUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
      setData(null);
      setError("The requested user ID is invalid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.get(`/admin/users/${id}`);
      const result = response.data?.data;

      if (!result?.user) {
        setData(null);
        setError("User details were not found.");
        return;
      }

      setData(result);
    } catch (err) {
      console.error("Unable to load admin user details:", err);

      setData(null);
      setError(
        err?.response?.data?.message ||
          "Unable to load this user's details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const user = data?.user;

  const panelClass =
    "rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6";

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      <Sidebar />

      <div className="min-w-0 lg:ml-64">
        <Navbar />

        <main className="space-y-6 px-4 py-6 pt-20 sm:px-6 lg:pt-6">
          {/* Page heading */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="mb-3 text-sm text-emerald-300 transition hover:text-emerald-200"
              >
                ← Back to Admin Dashboard
              </button>

              <h1 className="text-2xl font-bold sm:text-3xl">
                User Details
              </h1>

              <p className="mt-1 text-sm text-gray-400">
                Review account information and recorded activity.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUser}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </header>

          {/* Loading state */}
          {loading && !user && (
            <div
              role="status"
              className={`${panelClass} py-16 text-center text-gray-400`}
            >
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />
              Loading user information...
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6"
            >
              <h2 className="font-semibold text-red-200">
                Unable to display user
              </h2>

              <p className="mt-2 text-sm text-red-200/80">{error}</p>

              <button
                type="button"
                onClick={fetchUser}
                className="mt-4 rounded-lg border border-red-300/20 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/10"
              >
                Try again
              </button>
            </div>
          )}

          {/* User profile */}
          {user && (
            <>
              <section className={panelClass}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-2xl font-bold text-emerald-300">
                    {(user.name || user.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-xl font-bold sm:text-2xl">
                      {user.name || "Unnamed user"}
                    </h2>

                    <p className="mt-1 break-all text-sm text-gray-400">
                      {user.email || "No email available"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                        {user.role || "user"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          Boolean(user.isOnboardingComplete)
                            ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border border-amber-400/20 bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {Boolean(user.isOnboardingComplete)
                          ? "Profile completed"
                          : "Setup incomplete"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity statistics */}
              <section aria-label="User activity statistics">
                <h2 className="mb-3 font-semibold text-gray-200">
                  Activity overview
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Workouts"
                    value={data.totalWorkouts}
                    icon="🏋️"
                    description="Recorded workout sessions"
                  />

                  <StatCard
                    label="Calories burned"
                    value={data.totalCalories}
                    icon="🔥"
                    description="Calories burned in recorded workouts"
                  />

                  <StatCard
                    label="Diet calories"
                    value={data.totalDietCalories}
                    icon="🥗"
                    description="Calories from recorded food entries"
                  />
                </div>
              </section>

              {/* Account details */}
              <section className={panelClass}>
                <h2 className="mb-4 font-semibold">Account information</h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoCard label="User ID" value={user.id} />
                  <InfoCard label="Email" value={user.email} />
                  <InfoCard label="Account role" value={user.role} />
                  <InfoCard label="Age" value={user.age} />
                  <InfoCard
                    label="Height"
                    value={user.height ? `${user.height} cm` : null}
                  />
                  <InfoCard
                    label="Weight"
                    value={user.weight ? `${user.weight} kg` : null}
                  />
                  <InfoCard label="Gender" value={user.gender} />
                  <InfoCard label="Fitness goal" value={user.goal} />
                  <InfoCard
                    label="Activity level"
                    value={user.activityLevel}
                  />
                  <InfoCard
                    label="Joined"
                    value={formatDate(user.created_at)}
                  />
                </div>
              </section>

              <p className="pb-4 text-center text-xs text-gray-600">
                FitnessSupplementTrackerr · User Administration
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
