
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Diet from "./pages/Diet";
import Workout from "./pages/Workout";
import Supplements from "./pages/Supplements";
import Profile from "./pages/Profile";
import Onboarding from "./pages/onboarding/Onboarding";

import Admin from "./pages/Admin";
import AdminUser from "./pages/AdminUser";

import ProtectedRoute from "./components/ProtectedRoute";
import AICoach from "./pages/AICoach";

function AppRoutes() {
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthVersion((version) => version + 1);
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Re-render when authentication data changes.
  void authVersion;

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isLoggedIn = Boolean(token && user);
  const onboardingComplete =
    user?.isOnboardingComplete === true ||
    Number(user?.isOnboardingComplete) === 1;

  return (
    <Routes>
      {/* ROOT */}
      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <Auth />
          ) : onboardingComplete ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />

      {/* ONBOARDING */}
      <Route
        path="/onboarding"
        element={
          !isLoggedIn ? (
            <Navigate to="/" replace />
          ) : onboardingComplete ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Onboarding />
          )
        }
      />

      {/* PROTECTED ROUTES */}

<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/diet" element={<Diet />} />
  <Route path="/workout" element={<Workout />} />
  <Route path="/supplements" element={<Supplements />} />
  <Route path="/profile" element={<Profile />} />

  <Route path="/admin" element={<Admin />} />
  <Route path="/admin/user/:id" element={<AdminUser />} />

  <Route path="/ai-coach" element={<AICoach />} />
</Route>


      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
