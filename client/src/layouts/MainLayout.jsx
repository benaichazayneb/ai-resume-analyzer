import { Link, Outlet, useLocation } from "react-router-dom";
import { FiUpload, FiGrid, FiClock, FiUser } from "react-icons/fi";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/upload-resume", label: "Upload Resume", icon: FiUpload },
  { to: "/history", label: "History", icon: FiClock },
  { to: "/profile", label: "Profile", icon: FiUser },
];

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            AI Resume Analyzer
          </Link>
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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
