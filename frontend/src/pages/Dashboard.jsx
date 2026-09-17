import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import API from "../services/api";

import {
  Line,
  Bar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

/* =========================
   CHART SETUP
========================= */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {

  /* =========================
     STATES
  ========================= */
  const [weeklyCalories, setWeeklyCalories] =
    useState(Array(7).fill(0));

  const [weeklyWorkouts, setWeeklyWorkouts] =
    useState(Array(7).fill(0));

  const [todayCalories, setTodayCalories] =
    useState(0);

  const [todayWorkout, setTodayWorkout] =
    useState(0);

  const [dietStreak, setDietStreak] =
    useState(0);

  const [supplementStreak, setSupplementStreak] =
    useState(0);

  const [goalData, setGoalData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [needsProfile, setNeedsProfile] =
    useState(false);

  /* =========================
     STREAK CALCULATOR
  ========================= */
  const calculateStreak = (data = []) => {

    if (!Array.isArray(data) || data.length === 0) return 0;
  
    const dates = data
      .map(d => {
        const date = new Date(d.created_at);
        if (isNaN(date.getTime())) return null;
  
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter(Boolean);
  
    const unique = [...new Set(dates)].sort((a, b) => b - a);
  
    let streak = 0;
  
    let current = new Date();
    current.setHours(0, 0, 0, 0);
  
    for (let i = 0; i < unique.length; i++) {
  
      if (unique[i] === current.getTime()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
  
    return streak;
  };

  /* =========================
     FETCH DASHBOARD
  ========================= */
  const fetchData = async () => {

    try {

      setLoading(true);

      /* =====================
         API CALLS
      ===================== */
      const [
        dietRes,
        workoutRes,
        intakeRes,
        goalRes
      ] = await Promise.allSettled([

        API.get("/diet/entries"),

        API.get("/workouts/sessions"),

        API.get("/supplements/intake"),

        API.get("/goals/daily")

      ]);

      /* =====================
         SAFE DATA
      ===================== */
      const diet =
        dietRes.status === "fulfilled"
          ? dietRes.value?.data?.data || []
          : [];

      const workouts =
        workoutRes.status === "fulfilled"
          ? workoutRes.value?.data?.data || []
          : [];

      const intake =
        intakeRes.status === "fulfilled"
          ? intakeRes.value?.data?.data || []
          : [];

      const goal =
        goalRes.status === "fulfilled"
          ? goalRes.value?.data?.data || null
          : null;

      /* =====================
         ARRAYS
      ===================== */
      const calArr = Array(7).fill(0);

      const workoutArr =
        Array(7).fill(0);

      let todayCal = 0;

      let todayW = 0;

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      /* =====================
         DIET
      ===================== */
      diet.forEach((e) => {

        const date = new Date(
          e.date || e.created_at
        );

        const day = date.getDay();

        calArr[day] +=
          Number(
            e.totalCalories ||
            e.calories ||
            0
          );

        if (date >= today) {

          todayCal += Number(
            e.totalCalories ||
            e.calories ||
            0
          );

        }

      });

      /* =====================
         WORKOUTS
      ===================== */
      workouts.forEach((w) => {

        const date = new Date(
          w.date || w.created_at
        );

        const day = date.getDay();

        workoutArr[day] += 1;

        if (date >= today) {

          todayW++;

        }

      });

      /* =====================
         SET STATE
      ===================== */
      setWeeklyCalories(calArr);

      setWeeklyWorkouts(workoutArr);

      setTodayCalories(todayCal);

      setTodayWorkout(todayW);

      setDietStreak(
        calculateStreak(diet)
      );

      setSupplementStreak(
        calculateStreak(intake)
      );

      if (!goal) {

        setNeedsProfile(true);

      } else {

        setGoalData(goal);

        setNeedsProfile(false);

      }

    } catch (err) {

      console.log(
        "DASHBOARD ERROR:",
        err
      );

    } finally {

      setLoading(false);

    }

  };

  /* =========================
     AUTO REFRESH
  ========================= */
  useEffect(() => {

    fetchData();

    const listener = () =>
      fetchData();

    window.addEventListener(
      "dataUpdated",
      listener
    );

    return () => {

      window.removeEventListener(
        "dataUpdated",
        listener
      );

    };

  }, []);

  /* =========================
     CHART DATA
  ========================= */
  const labels = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
  ];

  const calorieChart = {

    labels,

    datasets: [
      {
        label: "Calories",

        data: weeklyCalories,

        borderColor: "#22c55e",

        backgroundColor: "#22c55e33",

        tension: 0.4
      }
    ]

  };

  const workoutChart = {

    labels,

    datasets: [
      {
        label: "Workouts",

        data: weeklyWorkouts,

        backgroundColor: "#3b82f6"
      }
    ]

  };

  const options = {

    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0"
        }
      }
    },

    scales: {

      x: {
        ticks: {
          color: "#94a3b8"
        }
      },

      y: {
        ticks: {
          color: "#94a3b8"
        }
      }

    }

  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {

    return (

      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-gray-400">
        Loading dashboard...
      </div>

    );

  }

  /* =========================
     PROFILE REQUIRED
  ========================= */
  if (needsProfile) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">

        <div className="bg-[#1e293b] p-6 rounded-2xl w-80 space-y-4">

          <h2 className="text-2xl font-bold">
            Complete Profile 🚀
          </h2>

          <p className="text-gray-400 text-sm">
            Add body details to unlock goals
          </p>

          <button
            onClick={() =>
              (
                window.location.href =
                  "/profile"
              )
            }
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
          >
            Go to Profile →
          </button>

        </div>

      </div>

    );

  }

  /* =========================
     UI
  ========================= */
  return (

    <div className="flex bg-[#020617] text-white min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-6 space-y-6">

          {/* TITLE */}
          <div>

            <h1 className="text-3xl font-bold">
              Dashboard 🚀
            </h1>

            <p className="text-gray-400 mt-1">
              Track your daily fitness progress
            </p>

          </div>

          {/* DAILY GOAL */}
          <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg">

            <h2 className="font-semibold mb-4">
              Daily Goal 🎯
            </h2>

            <div className="h-3 bg-black rounded overflow-hidden">

              <div
                className="h-full bg-green-500"
                style={{
                  width: `${
                    goalData?.intakePercent || 0
                  }%`
                }}
              />

            </div>

            <p className="text-sm mt-3 text-gray-300">

              {goalData?.consumed || 0}
              {" / "}
              {goalData?.intakeGoal || 0}
              {" kcal"}

            </p>

          </div>

          {/* COACH */}
          <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg">

            <h2 className="font-semibold mb-2">
              Coach 🧠
            </h2>

            <p className="text-yellow-400 text-sm">

              {goalData?.suggestion ||
                "Keep going 💪"}

            </p>

          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-[#1e293b] p-5 rounded-2xl text-center">

              <p className="text-xs text-gray-400">
                Calories
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {todayCalories}
              </h2>

            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl text-center">

              <p className="text-xs text-gray-400">
                Workouts
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {todayWorkout}
              </h2>

            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl text-center">

              <p className="text-xs text-gray-400">
                Diet Streak
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {dietStreak}
              </h2>

            </div>

            <div className="bg-[#1e293b] p-5 rounded-2xl text-center">

              <p className="text-xs text-gray-400">
                Supplement
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {supplementStreak}
              </h2>

            </div>

          </div>

          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* CALORIES */}
            <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg">

              <h2 className="mb-4 font-semibold">
                Weekly Calories 🍗
              </h2>

              {weeklyCalories.every(
                (v) => v === 0
              ) ? (

                <p className="text-gray-400 text-center">
                  No diet data yet
                </p>

              ) : (

                <Line
                  data={calorieChart}
                  options={options}
                />

              )}

            </div>

            {/* WORKOUT */}
            <div className="bg-[#1e293b] p-5 rounded-2xl shadow-lg">

              <h2 className="mb-4 font-semibold">
                Weekly Workouts 💪
              </h2>

              {weeklyWorkouts.every(
                (v) => v === 0
              ) ? (

                <p className="text-gray-400 text-center">
                  No workout data yet
                </p>

              ) : (

                <Bar
                  data={workoutChart}
                  options={options}
                />

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}