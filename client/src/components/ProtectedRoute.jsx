
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-slate-500">
        Loading...
      </p>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultPath =
      user.role === "RECRUITER"
        ? "/recruiter/dashboard"
        : "/candidate/dashboard";

    return <Navigate to={defaultPath} replace />;
  }

  return children;
}