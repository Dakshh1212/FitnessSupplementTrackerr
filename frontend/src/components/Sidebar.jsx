import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

export default function Sidebar() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm";

  const activeClass =
    "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";

  const normalClass =
    "text-gray-400 hover:bg-[#1e293b] hover:text-white";

  const logout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="h-screen w-64 bg-[#020617] border-r border-gray-800 p-5 flex flex-col justify-between">

      {/* 🔥 TOP */}
      <div>

        {/* LOGO */}
        <div
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer mb-8 text-center"
        >
          <h1 className="text-2xl font-bold text-white">
            💪 FitTrack
          </h1>
          <p className="text-xs text-gray-500">
            Fitness Dashboard
          </p>
        </div>

        {/* 🔥 NAV LINKS */}
        <div className="flex flex-col gap-2">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : normalClass}`
            }
          >
            🏠 Dashboard
          </NavLink>

          <NavLink
            to="/diet"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : normalClass}`
            }
          >
            🍎 Diet
          </NavLink>

          <NavLink
            to="/workout"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : normalClass}`
            }
          >
            🏋️ Workout
          </NavLink>

          <NavLink
            to="/supplements"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : normalClass}`
            }
          >
            💊 Supplements
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : normalClass}`
            }
          >
            👤 Profile
          </NavLink>

        </div>
      </div>

      {/* 🔥 BOTTOM */}
      <div className="space-y-4">

        {/* USER */}
        <div className="text-center text-sm text-gray-400">
          {user?.name || "User"}
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-lg text-sm"
        >
          Logout 🚪
        </button>

        {/* FOOTER */}
        <p className="text-xs text-gray-600 text-center">
          Built by Daksh 🚀
        </p>

      </div>

    </div>
  );
}