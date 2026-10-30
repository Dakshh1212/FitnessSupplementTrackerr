
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

const navigationItems = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/diet", label: "Nutrition", icon: "◉" },
  { to: "/workout", label: "Workouts", icon: "↗" },
  { to: "/supplements", label: "Supplements", icon: "✳" },
  { to: "/profile", label: "My Profile", icon: "◎" },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logoutUser();
    navigate("/", { replace: true });
  };

  const sidebarContent = (
    <>
      <div>
        {/* Brand */}
        <button
          type="button"
          onClick={() => {
            navigate("/dashboard");
            closeMobileMenu();
          }}
          className="mb-10 flex w-full items-center gap-3 text-left"
          aria-label="Go to FitTrack dashboard"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-slate-950 shadow-lg shadow-emerald-500/10">
            F
          </span>

          <span>
            <span className="block text-lg font-bold tracking-tight text-white">
              FitTrack
            </span>
            <span className="block text-xs text-slate-500">
              Your fitness companion
            </span>
          </span>
        </button>

        {/* Navigation */}
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </div>

        <nav aria-label="Main navigation" className="space-y-1.5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border border-emerald-400/15 bg-emerald-400/10 text-emerald-300 shadow-sm"
                    : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors",
                      isActive
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-white/[0.03] text-slate-500 group-hover:text-slate-200",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {isActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-emerald-300"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Motivation card */}
        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-emerald-300" aria-hidden="true">
              ✦
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Stay consistent
            </span>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Small steps every day lead to meaningful progress.
          </p>
        </div>
      </div>

      {/* Account section */}
      <div className="mt-8">
        <div className="mb-4 border-t border-white/[0.07]" />

        <div className="mb-4 flex min-w-0 items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-300">
            {(user?.name || "U").trim().charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-200">
              {user?.name || "Your Account"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || "Fitness member"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-medium text-slate-400 transition hover:border-red-400/10 hover:bg-red-400/[0.07] hover:text-red-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-base">
            ↪
          </span>
          Sign out
        </button>

        <p className="mt-5 text-center text-[10px] tracking-wide text-slate-600">
          FITTRACK · BUILT WITH PURPOSE
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.07] bg-slate-950/95 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5"
          aria-label="Go to dashboard"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 font-black text-slate-950">
            F
          </span>
          <span className="font-bold text-white">FitTrack</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-xl text-slate-200 transition hover:bg-white/5"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "×" : "☰"}
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between overflow-y-auto border-r border-white/[0.07] bg-slate-950 p-5 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col justify-between overflow-y-auto border-r border-white/10 bg-slate-950 p-5 pt-7 shadow-2xl">
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>

            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
