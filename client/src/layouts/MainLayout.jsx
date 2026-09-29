import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
FiGrid,
FiUpload,
FiClock,
FiUser,
FiLogOut,
FiBriefcase,
FiUsers,
FiVideo,
FiBarChart2,
FiSettings,
FiChevronDown,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext"; 
export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const candidateLinks = [ { to: "/candidate/dashboard", label: "Dashboard", icon: FiGrid }, { to: "/upload-resume", label: "Upload CV", icon: FiUpload }, { to: "/history", label: "Applications", icon: FiClock }, { to: "/profile", label: "Profile", icon: FiUser }, ]; 
  const recruiterLinks = [ { to: "/recruiter/dashboard", label: "Dashboard", icon: FiGrid }, { to: "/profile", label: "Profile", icon: FiUser }, ];
  const navLinks = user?.role === "RECRUITER" ? recruiterLinks : candidateLinks;


  const isActive = (path) => {
  if (path === "/recruiter/dashboard") {
  return location.pathname === path;
  }


  return location.pathname === path ||
    location.pathname.startsWith(`${path}/`);


  };

  const handleLogout = () => {
  logout();
  navigate("/");
  };

  return ( <div className="min-h-screen bg-[#F6F6F8] text-[#111111]">

    {/* ================= SIDEBAR ================= */}
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-gray-200 bg-white lg:flex lg:flex-col">

      {/* Logo */}
      <div className="flex h-[76px] items-center border-b border-gray-100 px-6">
        <Link to="/" className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6D5DFB] text-sm font-bold text-white">
            T
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight">
              TalentLink
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400">
              AI Recruitment
            </p>
          </div>

        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Workspace
        </p>

        <nav className="space-y-1">

          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);

            return (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[#6D5DFB]/10 font-medium text-[#6D5DFB]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#111111]"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${
                    active
                      ? "text-[#6D5DFB]"
                      : "text-gray-400 group-hover:text-gray-700"
                  }`}
                />

                {label}
              </Link>
            );
          })}

        </nav>
      </div>
      {/* Bottom */}
      <div className="border-t border-gray-100 p-4">

        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-gray-50"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6D5DFB]/10 text-sm font-semibold text-[#6D5DFB]">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-gray-400">
              {user?.role === "RECRUITER"
                ? "Recruiter"
                : "Candidate"}
            </p>
          </div>

          <FiChevronDown className="h-4 w-4 text-gray-400" />

        </Link>

      </div>

    </aside>

    {/* ================= MOBILE HEADER ================= */}
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white lg:hidden">

      <div className="flex h-[68px] items-center justify-between px-5">

        <Link to="/" className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6D5DFB] text-xs font-bold text-white">
            T
          </div>

          <span className="font-semibold">
            TalentLink
          </span>

        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-900"
          title="Log out"
        >
          <FiLogOut className="h-5 w-5" />
        </button>

      </div>

      {/* Mobile navigation */}
      <div className="overflow-x-auto border-t border-gray-100 px-4 py-2">

        <nav className="flex min-w-max gap-1">

          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  active
                    ? "bg-[#6D5DFB]/10 text-[#6D5DFB]"
                    : "text-gray-500"
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

    {/* ================= MAIN ================= */}
    <div className="lg:pl-[250px]">

      {/* Topbar */}
      <header className="hidden h-[76px] items-center justify-between border-b border-gray-200 bg-white px-8 lg:flex">

        <div>
          <p className="text-sm text-gray-400">
            {user?.role === "RECRUITER"
              ? "Recruitment workspace"
              : "Candidate workspace"}
          </p>

        </div>

        <div className="flex items-center gap-4">

          <div className="h-8 w-px bg-gray-200" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#111111]"
          >
            <FiLogOut className="h-4 w-4" />
            Log out
          </button>

        </div>

      </header>

      {/* Page content */}
      <main className="min-h-[calc(100vh-76px)] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <Outlet />
      </main>

    </div>

  </div>

  );
}
