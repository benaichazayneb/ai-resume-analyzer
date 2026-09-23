
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiGrid,
  FiClock,
  FiUser,
  FiLogOut,
  FiBriefcase,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const candidateLinks = [
    { to: "/candidate/dashboard", label: "Dashboard", icon: FiGrid },
    { to: "/upload-resume", label: "Upload CV", icon: FiUpload },
    { to: "/history", label: "Applications", icon: FiClock },
    { to: "/profile", label: "Profile", icon: FiUser },
  ];

  const recruiterLinks = [
    { to: "/recruiter/dashboard", label: "Dashboard", icon: FiGrid },
    { to: "/profile", label: "Profile", icon: FiUser },
  ];

  const navLinks =
    user?.role === "RECRUITER"
      ? recruiterLinks
      : candidateLinks;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            AI Resume Analyzer
          </Link>

          {user ? (
            <nav className="flex flex-wrap items-center gap-4">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;

                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 text-sm ${
                      active
                        ? "font-medium text-slate-900"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
              >
                <FiLogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Sign up
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}