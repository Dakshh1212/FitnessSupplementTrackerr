import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { logoutUser } from "../services/authService";
import API from "../services/api";

export default function Navbar() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loadingStreak, setLoadingStreak] = useState(true);

  const notifiedRef = useRef(false);

  /* ================= LOGOUT ================= */
  const logout = () => {
    logoutUser();
    navigate("/");
  };

  /* ================= USER LOAD ================= */
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  /* ================= REMINDERS ================= */
  useEffect(() => {

    const fetchReminders = async () => {
      try {
        const res = await API.get("/supplements/reminders/today");
        setReminders(res?.data?.data || []);
      } catch (err) {
        console.log("Reminder error:", err.message);
      }
    };

    fetchReminders();

  }, []);

  /* ================= STREAK FETCH (REAL) ================= */
  useEffect(() => {

    const fetchStreak = async () => {
      try {

        setLoadingStreak(true);

        const res = await API.get("/dashboard");

        const s = res?.data?.data?.streaks?.workoutStreak;

        setStreak(s ?? 0);

      } catch (err) {
        console.log("Streak error:", err.message);
        setStreak(0);
      } finally {
        setLoadingStreak(false);
      }

    };

    fetchStreak();

  }, []);

  /* ================= NOTIFICATIONS ================= */
  useEffect(() => {

    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (reminders.length > 0 && !notifiedRef.current) {

      reminders.forEach((r) => {
        new Notification("💊 Supplement Reminder", {
          body: `Take ${r.name} (${r.timing || "morning"})`
        });
      });

      notifiedRef.current = true;
    }

  }, [reminders]);

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">

      {/* ================= LOGO ================= */}
      <div
        onClick={() => navigate("/dashboard")}
        className="cursor-pointer"
      >
        <h1 className="text-lg font-bold text-white">
          💪 FitTrack
        </h1>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-3">

        {/* 🔥 STREAK BADGE (REAL) */}
        <div className="hidden md:flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">

<span className="text-orange-400 text-sm">🔥</span>

<span className="text-xs text-orange-400 font-semibold">
  {loadingStreak
    ? "Loading..."
    : (streak || 0) > 0
    ? `${streak} day streak 🔥`
    : "Start your streak today 🚀"}
</span>

</div>

        {/* ================= USER ================= */}
        <span className="text-sm text-gray-300 hidden md:block">
          {user?.name || "User"}
        </span>

        {/* ================= ADMIN ================= */}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm transition"
          >
            Admin
          </button>
        )}

        {/* ================= PROFILE ================= */}
        <button
          onClick={() => navigate("/profile")}
          className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-sm transition"
        >
          Profile
        </button>

        {/* ================= LOGOUT ================= */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
}