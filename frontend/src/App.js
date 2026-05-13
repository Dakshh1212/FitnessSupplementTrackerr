import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

function App() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={
            !token ? (
              <Auth />
            ) : !user ? (
              <Auth />
            ) : !user.isOnboardingComplete ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* ONBOARDING */}
        <Route
          path="/onboarding"
          element={
            !token ? (
              <Navigate to="/" replace />
            ) : user?.isOnboardingComplete ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Onboarding />
            )
          }
        />

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/user/:id" element={<AdminUser />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;