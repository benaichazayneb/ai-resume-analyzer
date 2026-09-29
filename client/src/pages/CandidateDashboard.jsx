import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiFileText,
  FiBriefcase,
  FiArrowUpRight,
  FiSearch,
  FiClock,
  FiUser,
} from "react-icons/fi";

export default function CandidateDashboard() {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

        <div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
            Welcome, {firstName}.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Manage your resume, discover opportunities and track
            your recruitment journey.
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Explore opportunities
          <FiArrowUpRight className="h-4 w-4" />
        </Link>

      </div>


      {/* ===================================================== */}
      {/* QUICK STATS */}
      {/* ===================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Resume */}
        <Link
          to="/upload-resume"
          className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#D8D3FF] hover:shadow-sm"
        >
          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
              <FiFileText className="h-5 w-5" />
            </div>

            <FiArrowUpRight className="h-4 w-4 text-gray-300 transition group-hover:text-[#6D5DFB]" />

          </div>

          <p className="mt-5 text-sm font-medium text-gray-500">
            Resume
          </p>

          <p className="mt-1 text-lg font-semibold text-[#111111]">
            Manage your CV
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Upload or update your resume
          </p>
        </Link>


        {/* Jobs */}
        <Link
          to="/jobs"
          className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#D8D3FF] hover:shadow-sm"
        >
          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <FiBriefcase className="h-5 w-5" />
            </div>

            <FiArrowUpRight className="h-4 w-4 text-gray-300 transition group-hover:text-[#6D5DFB]" />

          </div>

          <p className="mt-5 text-sm font-medium text-gray-500">
            Opportunities
          </p>

          <p className="mt-1 text-lg font-semibold text-[#111111]">
            Browse jobs
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Discover available positions
          </p>
        </Link>


        {/* Applications */}
        <Link
          to="/applications"
          className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#D8D3FF] hover:shadow-sm"
        >
          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <FiClock className="h-5 w-5" />
            </div>

            <FiArrowUpRight className="h-4 w-4 text-gray-300 transition group-hover:text-[#6D5DFB]" />

          </div>

          <p className="mt-5 text-sm font-medium text-gray-500">
            Applications
          </p>

          <p className="mt-1 text-lg font-semibold text-[#111111]">
            Track applications
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Follow your recruitment progress
          </p>
        </Link>

      </div>


      {/* ===================================================== */}
      {/* CANDIDATE JOURNEY */}
      {/* ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

        {/* Main action */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111111] p-7 text-white">

          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#6D5DFB]/20 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6D5DFB]">
                <FiFileText className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Your resume
                </p>

                <p className="text-[10px] text-gray-400">
                  Keep your profile ready
                </p>
              </div>

            </div>

            <h2 className="mt-7 max-w-xl text-2xl font-semibold leading-tight">
              Upload your CV and start exploring opportunities.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Add your resume once, then browse available job offers
              and apply to the opportunities that match your profile.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <Link
                to="/upload-resume"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-gray-100"
              >
                Upload CV
                <FiArrowUpRight className="h-4 w-4" />
              </Link>

              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Browse jobs
              </Link>

            </div>

          </div>
        </div>


        {/* Recruitment journey */}
        <div className="rounded-2xl border border-gray-200 bg-white p-7">

          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Your journey
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#111111]">
            From profile to application
          </h2>

          <div className="mt-6 space-y-5">

            {/* Step 1 */}
            <div className="flex items-center gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0EEFF] text-sm font-semibold text-[#6D5DFB]">
                01
              </div>

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Upload your CV
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Add your resume to your profile
                </p>
              </div>

            </div>


            {/* Connector */}
            <div className="ml-[18px] h-4 border-l border-dashed border-gray-200" />


            {/* Step 2 */}
            <div className="flex items-center gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                02
              </div>

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Explore job offers
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Discover available opportunities
                </p>
              </div>

            </div>


            {/* Connector */}
            <div className="ml-[18px] h-4 border-l border-dashed border-gray-200" />


            {/* Step 3 */}
            <div className="flex items-center gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                03
              </div>

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Apply
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Submit your application
                </p>
              </div>

            </div>


            {/* Connector */}
            <div className="ml-[18px] h-4 border-l border-dashed border-gray-200" />


            {/* Step 4 */}
            <div className="flex items-center gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                04
              </div>

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Track applications
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Follow the status of your applications
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================== */}
      {/* QUICK ACTIONS */}
      {/* ===================================================== */}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Get started
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#111111]">
              Continue your recruitment journey
            </h2>
          </div>

        </div>


        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            to="/upload-resume"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-[#F8F8FA] p-4 transition hover:border-[#D8D3FF] hover:bg-[#F5F3FF]"
          >
            <div className="flex items-center gap-3">

              <FiFileText className="h-4 w-4 text-[#6D5DFB]" />

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Analyze CV
                </p>

                <p className="text-xs text-gray-400">
                  Get AI-powered insights
                </p>
              </div>

            </div>

            <FiArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#6D5DFB]" />
          </Link>


          <Link
            to="/jobs"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-[#F8F8FA] p-4 transition hover:border-[#D8D3FF] hover:bg-[#F5F3FF]"
          >
            <div className="flex items-center gap-3">

              <FiSearch className="h-4 w-4 text-[#6D5DFB]" />

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Explore jobs
                </p>

                <p className="text-xs text-gray-400">
                  Find your next opportunity
                </p>
              </div>

            </div>

            <FiArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#6D5DFB]" />
          </Link>


          <Link
            to="/applications"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-[#F8F8FA] p-4 transition hover:border-[#D8D3FF] hover:bg-[#F5F3FF]"
          >
            <div className="flex items-center gap-3">

              <FiClock className="h-4 w-4 text-[#6D5DFB]" />

              <div>
                <p className="text-sm font-medium text-[#111111]">
                  Applications
                </p>

                <p className="text-xs text-gray-400">
                  Follow your applications
                </p>
              </div>

            </div>

            <FiArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#6D5DFB]" />
          </Link>

        </div>

      </div>

    </div>
  );
}