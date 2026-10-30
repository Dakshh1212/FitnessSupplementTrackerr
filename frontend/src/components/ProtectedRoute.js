
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();

  let token = null;

  try {
    token = localStorage.getItem("token");
  } catch (error) {
    console.error("Unable to access authentication storage.");
  }

  if (!token || !token.trim()) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
