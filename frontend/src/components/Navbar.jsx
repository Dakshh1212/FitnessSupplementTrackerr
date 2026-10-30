
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { logoutUser } from "../services/authService";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(readStoredUser);
  const [reminders, setReminders] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loadingReminders, setLoadingReminders] = useState(true);

  const remindersRef = useRef(null);

  const fetchReminders = useCallback(async () => {
    setLoadingReminders(true);

    try {
      const res = await API.get("/supplements/reminders/today");
      const data = res?.data?.data;
      setReminders(Array.isArray(data) ? data : []);
    } catch {
      setReminders([]);
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    setLoadingStreak(true);

    try {
      const res = await API.get("/dashboard");
      const value = res?.data?.data?.streaks?.workoutStreak;
      const parsed = Number(value);

      setStreak(Number.isFinite(parsed) ? parsed : 0);
    } catch {
      setStreak(0);
    } finally {
      setLoadingStreak(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    fetchStreak();
  }, [fetchReminders, fetchStreak]);

  useEffect(() => {
    const handleStorage = () => setUser(readStoredUser());

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!remindersOpen) return;

    const handleOutsideClick = (event) => {
      if (
        remindersRef.current &&
        !remindersRef.current.contains(event.target)
      ) {
        setRemindersOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setRemindersOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [remindersOpen]);

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  const enableNotifications = async () => {
    setNotificationMessage("");

    if (!("Notification" in window)) {
      setNotificationMessage(
        "Browser notifications are not supported in this browser."
      );
      return;
    }

    try {
      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setNotificationMessage(
          "Notifications are disabled. You can enable them in browser settings."
        );
        return;
      }

      if (reminders.length === 0) {
        setNotificationMessage("You have no supplement reminders for today.");
        return;
      }

      const firstReminder = reminders[0];
      const extraCount = reminders.length - 1;

      new Notification("FitTrack supplement reminder", {
        body: `Remember ${firstReminder.name}${
          firstReminder.timing ? ` · ${firstReminder.timing}` : ""
        }${extraCount > 0 ? ` and ${extraCount} more reminder(s)` : ""}.`,
      });

      setNotificationMessage("Notification sent successfully.");
    } catch {
      setNotificationMessage(
        "Unable to show a notification. Check your browser permissions."
      );
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-slate-950/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex min-h-10 items-center justify-between gap-3">
        {/* Page identity */}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            YOUR FITNESS JOURNEY
          </p>
          <h1 className="truncate text-base font-semibold text-white sm:text-lg">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Workout streak */}
          <div
            className="hidden items-center gap-2 rounded-xl border border-orange-400/15 bg-orange-400/[0.06] px-3 py-2 sm:flex"
            title="Your current workout streak"
          >
            <span aria-hidden="true" className="text-lg">
              🔥
            </span>
            <div>
              <p className="text-xs font-semibold text-orange-300">
                {loadingStreak
                  ? "Loading..."
                  : `${streak ?? 0} day${streak === 1 ? "" : "s"}`}
              </p>
              <p className="text-[10px] text-slate-500">Workout streak</p>
            </div>
          </div>

          {/* Supplement reminders */}
          <div className="relative" ref={remindersRef}>
            <button
              type="button"
              onClick={() => {
                setRemindersOpen((open) => !open);
                setNotificationMessage("");
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-slate-300 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.06] hover:text-emerald-300"
              aria-label={`Supplement reminders, ${reminders.length} today`}
              aria-expanded={remindersOpen}
            >
              ♧
              {reminders.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-emerald-400 px-1 text-[10px] font-bold text-slate-950">
                  {reminders.length > 9 ? "9+" : reminders.length}
                </span>
              )}
            </button>

            {remindersOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Supplement reminders
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Your schedule for today
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                    {reminders.length}
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto p-2">
                  {loadingReminders ? (
                    <p className="p-4 text-center text-sm text-slate-400">
                      Loading reminders...
                    </p>
                  ) : reminders.length === 0 ? (
                    <div className="p-5 text-center">
                      <p className="text-2xl" aria-hidden="true">
                        ✓
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        All clear for today
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        No supplement reminders found.
                      </p>
                    </div>
                  ) : (
                    reminders.map((reminder, index) => (
                      <div
                        key={reminder.id ?? `${reminder.name}-${index}`}
                        className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.03]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-lg">
                          💊
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-200">
                            {reminder.name || "Supplement"}
                          </p>
                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {reminder.timing || "Scheduled for today"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-white/[0.07] p-3">
                  {notificationMessage && (
                    <p
                      role="status"
                      className="mb-2 text-xs leading-5 text-slate-400"
                    >
                      {notificationMessage}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={enableNotifications}
                    disabled={loadingReminders}
                    className="w-full rounded-xl bg-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enable browser notification
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin link */}
          {user?.role === "admin" && (
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="hidden rounded-xl border border-purple-400/20 bg-purple-400/[0.07] px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-400/15 sm:inline-flex"
            >
              Admin
            </button>
          )}

{/* AI Fitness Coach */}
<button
  type="button"
  onClick={() => navigate("/ai-coach")}
  className="hidden rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/15 sm:inline-flex"
  title="Open AI Fitness Coach"
>
  ✨ AI Coach
</button>


          {/* Profile */}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.06]"
            aria-label="Open profile"
            title="Profile"
          >
            {(user?.name || "U").trim().charAt(0).toUpperCase()}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-xl border border-red-400/15 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/[0.07] sm:inline-flex"
          >
            Sign out
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/15 text-sm text-red-300 transition hover:bg-red-400/[0.07] sm:hidden"
            aria-label="Sign out"
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </div>

      {/* Compact streak for mobile */}
      <div className="mt-3 flex items-center gap-2 text-xs text-orange-300 sm:hidden">
        <span aria-hidden="true">🔥</span>
        <span>
          {loadingStreak
            ? "Loading workout streak..."
            : `${streak ?? 0} day${streak === 1 ? "" : "s"} workout streak`}
        </span>
      </div>
    </header>
  );
}
