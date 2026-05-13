import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { logoutUser } from "../services/authService";
import API from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);

  const notifiedRef = useRef(false); // 🔥 prevent spam

  const logout = () => {
    logoutUser();
    navigate("/");
  };

  // ✅ Load user safely
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  // 🔔 Fetch reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await API.get("/supplements/reminders/today");
        setReminders(res?.data?.data || []);
      } catch (err) {
        console.log("Reminder error:", err.response?.data || err.message);
      }
    };

    fetchReminders();
  }, []);

  // 🔔 Browser Notification (only once)
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    if (reminders.length > 0 && !notifiedRef.current) {
      reminders.forEach((r) => {
        new Notification("💊 Supplement Reminder", {
          body: `Time to take ${r.name}`
        });
      });

      notifiedRef.current = true; // 🔥 stop repeat
    }
  }, [reminders]);

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-[#020617] border-b border-gray-800">

      {/* LEFT */}
      <div
        onClick={() => navigate("/dashboard")}
        className="cursor-pointer"
      >
        <h1 className="text-lg font-semibold text-white">
          💪 FitTrack
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🔔 NOTIFICATION */}
        <div className="relative cursor-pointer">
          <span className="text-xl">🔔</span>

          {reminders.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-xs px-1 rounded">
              {reminders.length}
            </span>
          )}
        </div>

        {/* USER NAME */}
        <span className="text-sm text-gray-300 hidden md:block">
          {user?.name || "User"}
        </span>

        {/* 🛠️ ADMIN BUTTON */}
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-medium"
          >
            Admin
          </button>
        )}

        {/* PROFILE */}
        <button
          onClick={() => navigate("/profile")}
          className="bg-[#1e293b] px-3 py-1 rounded text-sm hover:bg-[#334155]"
        >
          Profile
        </button>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>

      </div>
    </div>
  );
}