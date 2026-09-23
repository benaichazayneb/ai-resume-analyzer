import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CandidateDashboard() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your resume, browse job offers and follow
          your applications.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            My Resume
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Upload or update your resume.
          </p>

          <Link
            to="/upload-resume"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload CV
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Job Offers
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Browse available opportunities.
          </p>

          <Link
            to="/jobs"
            className="mt-5 inline-block rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Browse Jobs
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            My Applications
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Follow the status of your applications.
          </p>

          <Link
            to="/applications"
            className="mt-5 inline-block rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            View Applications
          </Link>
        </div>
      </div>
    </div>
  );
}