import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiUpload, FiGrid, FiClock, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/upload-resume", label: "Upload Resume", icon: FiUpload },
  { to: "/history", label: "History", icon: FiClock },
  { to: "/profile", label: "Profile", icon: FiUser },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            AI Resume Analyzer
          </Link>

          {user ? (
            <nav className="flex items-center gap-6">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      active
                        ? "text-slate-900 font-medium"
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
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
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
