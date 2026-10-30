
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const DAY_MS = 24 * 60 * 60 * 1000;

const EMPTY_GOAL = {
  consumed: 0,
  intakeGoal: 0,
  intakePercent: 0,
  suggestion: "Start tracking your progress to receive personalized guidance.",
};

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRecordDate(record) {
  return parseDate(
    record?.date ??
      record?.created_at ??
      record?.createdAt
  );
}

function getLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getCalories(record) {
  return Math.max(
    0,
    Number(record?.totalCalories ?? record?.calories ?? 0) || 0
  );
}

function getWeeklyDates() {
  const today = startOfDay();
  const monday = new Date(today);
  const day = monday.getDay();

  monday.setDate(monday.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function calculateStreak(records = []) {
  if (!Array.isArray(records) || records.length === 0) return 0;

  const activeDays = new Set();

  records.forEach((record) => {
    const date = getRecordDate(record);
    if (date) activeDays.add(getLocalDateKey(date));
  });

  const today = startOfDay();
  const todayKey = getLocalDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // A streak remains active if the last activity was yesterday.
  let current = activeDays.has(todayKey) ? today : yesterday;
  let streak = 0;

  while (activeDays.has(getLocalDateKey(current))) {
    streak += 1;

    current = new Date(current);
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function getArrayResponse(result) {
  if (result.status !== "fulfilled") return [];

  const data = result.value?.data?.data;
  return Array.isArray(data) ? data : [];
}

function StatCard({ label, value, unit, icon, description, accent }) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-5 transition duration-200 hover:border-white/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-white">
              {value}
            </span>
            {unit && (
              <span className="text-xs text-slate-500">{unit}</span>
            )}
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [diet, setDiet] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [intake, setIntake] = useState([]);
  const [goalData, setGoalData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [failedSections, setFailedSections] = useState([]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError("");

    try {
      const results = await Promise.allSettled([
        API.get("/diet/entries"),
        API.get("/workouts/sessions"),
        API.get("/supplements/intake"),
        API.get("/goals/daily"),
      ]);

      const [dietResult, workoutResult, intakeResult, goalResult] =
        results;

      const failed = [];

      if (dietResult.status === "rejected") failed.push("diet");
      if (workoutResult.status === "rejected") failed.push("workouts");
      if (intakeResult.status === "rejected") failed.push("supplements");
      if (goalResult.status === "rejected") failed.push("goals");

      setDiet(getArrayResponse(dietResult));
      setWorkouts(getArrayResponse(workoutResult));
      setIntake(getArrayResponse(intakeResult));

      const goal =
        goalResult.status === "fulfilled"
          ? goalResult.value?.data?.data ?? null
          : null;

      setGoalData(goal);
      setFailedSections(failed);

      if (failed.length === results.length) {
        setLoadError(
          "We couldn't load your dashboard data. Check your connection and try again."
        );
      }
    } catch {
      setLoadError("Something went wrong while loading your dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleDataUpdated = () => fetchData(true);

    window.addEventListener("dataUpdated", handleDataUpdated);

    return () => {
      window.removeEventListener("dataUpdated", handleDataUpdated);
    };
  }, [fetchData]);

  const weeklyDates = useMemo(() => getWeeklyDates(), []);

  const todayStats = useMemo(() => {
    const today = startOfDay();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDiet = diet.filter((record) => {
      const date = getRecordDate(record);
      return date && date >= today && date < tomorrow;
    });

    const todayWorkouts = workouts.filter((record) => {
      const date = getRecordDate(record);
      return date && date >= today && date < tomorrow;
    });

    return {
      calories: Math.round(
        todayDiet.reduce((total, record) => total + getCalories(record), 0)
      ),
      workouts: todayWorkouts.length,
    };
  }, [diet, workouts]);

  const weeklyCalories = useMemo(() => {
    const totals = Object.fromEntries(
      weeklyDates.map((date) => [getLocalDateKey(date), 0])
    );

    diet.forEach((record) => {
      const date = getRecordDate(record);
      if (!date) return;

      const key = getLocalDateKey(date);

      if (Object.prototype.hasOwnProperty.call(totals, key)) {
        totals[key] += getCalories(record);
      }
    });

    return weeklyDates.map((date) =>
      Math.round(totals[getLocalDateKey(date)])
    );
  }, [diet, weeklyDates]);

  const weeklyWorkouts = useMemo(() => {
    const totals = Object.fromEntries(
      weeklyDates.map((date) => [getLocalDateKey(date), 0])
    );

    workouts.forEach((record) => {
      const date = getRecordDate(record);
      if (!date) return;

      const key = getLocalDateKey(date);

      if (Object.prototype.hasOwnProperty.call(totals, key)) {
        totals[key] += 1;
      }
    });

    return weeklyDates.map((date) => totals[getLocalDateKey(date)]);
  }, [workouts, weeklyDates]);

  const dietStreak = useMemo(() => calculateStreak(diet), [diet]);
  const supplementStreak = useMemo(
    () => calculateStreak(intake),
    [intake]
  );

  const calorieGoal = Math.max(
    0,
    Number(goalData?.intakeGoal) || 0
  );

  const consumedCalories = Math.max(
    0,
    Number(goalData?.consumed) || 0
  );

  const reportedPercent = Number(goalData?.intakePercent);

  const goalPercent =
    calorieGoal > 0
      ? Math.min(100, Math.round((consumedCalories / calorieGoal) * 100))
      : Math.max(0, Math.min(100, reportedPercent || 0));

  const remainingCalories = Math.max(
    0,
    calorieGoal - consumedCalories
  );

  const labels = weeklyDates.map((date) =>
    date.toLocaleDateString("en-US", { weekday: "short" })
  );

  const calorieChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Calories",
          data: weeklyCalories,
          borderColor: "#34d399",
          backgroundColor: "rgba(52, 211, 153, 0.12)",
          pointBackgroundColor: "#34d399",
          pointBorderColor: "#0f172a",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [labels.join(","), weeklyCalories.join(",")]
  );

  const workoutChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Workout sessions",
          data: weeklyWorkouts,
          backgroundColor: "rgba(96, 165, 250, 0.75)",
          hoverBackgroundColor: "#60a5fa",
          borderRadius: 7,
          maxBarThickness: 34,
        },
      ],
    }),
    [labels.join(","), weeklyWorkouts.join(",")]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#020617",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148,163,184,0.08)",
          },
          border: { display: false },
          ticks: {
            color: "#64748b",
            precision: 0,
            maxTicksLimit: 5,
          },
        },
      },
    }),
    []
  );

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300">
        <Sidebar />
        <main className="flex min-h-screen items-center justify-center px-5 pt-16 lg:ml-64 lg:pt-0">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">
              Preparing your fitness dashboard...
            </p>
          </div>
        </main>
      </div>
    );
  }

  const hasGoal = Boolean(goalData);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="min-w-0 pt-16 lg:ml-64 lg:pt-0">
        <Navbar />

        <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 xl:p-8">
          {/* Page heading */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Your personal overview
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Fitness dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {todayLabel} · Every step counts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:cursor-wait disabled:opacity-50 sm:self-auto"
            >
              <span aria-hidden="true">{refreshing ? "…" : "↻"}</span>
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </section>

          {/* Error handling */}
          {loadError && (
            <section
              role="alert"
              className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5"
            >
              <p className="font-semibold text-red-300">
                Dashboard data unavailable
              </p>
              <p className="mt-1 text-sm text-slate-400">{loadError}</p>
              <button
                type="button"
                onClick={() => fetchData()}
                className="mt-3 rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
              >
                Try again
              </button>
            </section>
          )}

          {failedSections.length > 0 && !loadError && (
            <div
              role="status"
              className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3 text-sm text-amber-200"
            >
              Some dashboard data could not be loaded:{" "}
              {failedSections.join(", ")}. Other sections may still be available.
            </div>
          )}

          {/* Goal overview */}
          <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <article className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[0.09] via-slate-900 to-slate-900 p-5 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-400/[0.07] blur-3xl"
              />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                      Daily nutrition target
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-white">
                      {hasGoal ? "Your calorie progress" : "Set your daily goal"}
                    </h2>
                  </div>

                  <span className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.08] px-3 py-2 text-sm font-bold text-emerald-300">
                    {hasGoal ? `${goalPercent}%` : "Not set"}
                  </span>
                </div>

                <div className="mt-7">
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {consumedCalories.toLocaleString()}
                        <span className="ml-2 text-sm font-normal text-slate-400">
                          kcal consumed
                        </span>
                      </p>
                    </div>
                    {calorieGoal > 0 && (
                      <p className="shrink-0 text-xs text-slate-400">
                        of {calorieGoal.toLocaleString()} kcal
                      </p>
                    )}
                  </div>

                  <div
                    className="h-3 overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-label="Daily calorie goal progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={goalPercent}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                      style={{ width: `${goalPercent}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
                    <span>
                      {hasGoal
                        ? calorieGoal > 0
                          ? `${remainingCalories.toLocaleString()} kcal remaining`
                          : "No calorie target configured"
                        : "Complete your profile to configure goals"}
                    </span>
                    <span>{goalPercent}% complete</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(hasGoal ? "/diet" : "/profile")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  {hasGoal ? "Log nutrition" : "Complete profile"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-5 sm:p-6">
              <SectionHeading
                eyebrow="Your next step"
                title="Fitness coach"
                description="Your dashboard guidance"
              />

              <div className="flex gap-3 rounded-xl border border-amber-300/10 bg-amber-300/[0.04] p-4">
                <span className="text-2xl" aria-hidden="true">
                  ✦
                </span>
                <p className="text-sm leading-6 text-slate-300">
                  {goalData?.suggestion ||
                    "Start logging your meals and workouts to build a clearer picture of your progress."}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/diet")}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3 text-left transition hover:bg-white/[0.05]"
                >
                  <span className="block text-sm font-medium text-white">
                    Log a meal
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Track nutrition
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/workout")}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3 text-left transition hover:bg-white/[0.05]"
                >
                  <span className="block text-sm font-medium text-white">
                    Log workout
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Track activity
                  </span>
                </button>
              </div>
            </article>
          </section>

          {/* Daily stats */}
          <section>
            <SectionHeading
              eyebrow="Today's activity"
              title="Your daily snapshot"
              description="Activity recorded for today"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Calories logged"
                value={todayStats.calories.toLocaleString()}
                unit="kcal"
                icon="◉"
                accent="bg-emerald-400/10 text-emerald-300"
                description="Food calories recorded today"
              />

              <StatCard
                label="Workouts"
                value={todayStats.workouts}
                icon="↗"
                accent="bg-blue-400/10 text-blue-300"
                description="Workout sessions recorded today"
              />

              <StatCard
                label="Diet streak"
                value={dietStreak}
                unit={dietStreak === 1 ? "day" : "days"}
                icon="◷"
                accent="bg-amber-400/10 text-amber-300"
                description="Consecutive days with diet entries"
              />

              <StatCard
                label="Supplement streak"
                value={supplementStreak}
                unit={supplementStreak === 1 ? "day" : "days"}
                icon="✳"
                accent="bg-violet-400/10 text-violet-300"
                description="Consecutive days with intake entries"
              />
            </div>
          </section>

          {/* Weekly charts */}
          <section>
            <SectionHeading
              eyebrow="Weekly performance"
              title="Your activity trends"
              description="Monday through Sunday, using records from the current week"
            />

            <div className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      Calorie intake
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Daily calories logged
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300">
                    kcal
                  </span>
                </div>

                <div className="h-64">
                  {weeklyCalories.some((value) => value > 0) ? (
                    <Line
                      data={calorieChart}
                      options={{
                        ...chartOptions,
                        scales: {
                          ...chartOptions.scales,
                          y: {
                            ...chartOptions.scales.y,
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-center">
                      <span className="text-2xl" aria-hidden="true">
                        ◉
                      </span>
                      <p className="mt-3 text-sm font-medium text-slate-300">
                        No calorie entries this week
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/diet")}
                        className="mt-2 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        Add your first meal →
                      </button>
                    </div>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-white/[0.07] bg-slate-900/70 p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      Workout consistency
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Sessions recorded each day
                    </p>
                  </div>
                  <span className="rounded-lg bg-blue-400/10 px-2.5 py-1.5 text-xs font-medium text-blue-300">
                    Sessions
                  </span>
                </div>

                <div className="h-64">
                  {weeklyWorkouts.some((value) => value > 0) ? (
                    <Bar data={workoutChart} options={chartOptions} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-center">
                      <span className="text-2xl" aria-hidden="true">
                        ↗
                      </span>
                      <p className="mt-3 text-sm font-medium text-slate-300">
                        No workouts recorded this week
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/workout")}
                        className="mt-2 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        Record a workout →
                      </button>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </section>

          {/* Quick navigation */}
          <section>
            <SectionHeading
              eyebrow="Keep moving"
              title="Quick actions"
              description="Jump directly to the tools you use most"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Nutrition tracker",
                  detail: "Record meals and calories",
                  icon: "◉",
                  path: "/diet",
                },
                {
                  title: "Workout log",
                  detail: "Record your training",
                  icon: "↗",
                  path: "/workout",
                },
                {
                  title: "Supplement planner",
                  detail: "Manage your supplement routine",
                  icon: "✳",
                  path: "/supplements",
                },
                {
                  title: "Your profile",
                  detail: "Review your personal details",
                  icon: "◎",
                  path: "/profile",
                },
              ].map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-slate-900/50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/20 hover:bg-slate-900"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-xl text-emerald-300 transition group-hover:bg-emerald-400/15">
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-200">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {item.detail}
                    </span>
                  </span>

                  <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-300">
                    →
                  </span>
                </button>
              ))}
            </div>
          </section>

          <footer className="border-t border-white/[0.06] py-5 text-center text-xs text-slate-600">
            FitTrack · Consistency over perfection.
          </footer>
        </div>
      </main>
    </div>
  );
}
