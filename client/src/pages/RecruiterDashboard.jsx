
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/jobs");
      setJobs(response.data.data || []);
    } catch (err) {
      console.error("Error loading jobs:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load job offers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCloseJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this job offer?"
    );

    if (!confirmed) return;

    try {
      await api.patch(`/jobs/${jobId}/close`);
      await fetchJobs();
    } catch (err) {
      console.error("Error closing job:", err);

      alert(
        err.response?.data?.message ||
          "Unable to close this job offer."
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Recruiter dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your job offers and review candidate applications.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Create Job Offer
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Job offers
          </h2>

          <p className="mt-2 text-gray-600">
            {jobs.length} offer(s) found
          </p>

          <Link
            to="/recruiter/jobs/new"
            className="mt-5 inline-block rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
          >
            + Add Job
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Candidate applications
          </h2>

          <p className="mt-2 text-gray-600">
            Open an offer below to review its candidates
            and launch matching.
          </p>
        </div>
      </div>

      {/* Job offers */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            My Job Offers
          </h2>

          <button
            onClick={fetchJobs}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading && (
          <p className="text-gray-500">
            Loading job offers...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-gray-600">
              You have not created any job offers yet.
            </p>

            <Link
              to="/recruiter/jobs/new"
              className="mt-4 inline-block font-medium text-blue-600 hover:underline"
            >
              Create your first job offer
            </Link>
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="rounded-lg border border-gray-200 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  {/* Job information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-line text-gray-600">
                      {job.description}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Created:{" "}
                      {job.createdAt
                        ? new Date(
                            job.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  {/* Status and actions */}
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        job.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : job.status === "CLOSED"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {job.status}
                    </span>

                    <Link
                      to={`/recruiter/jobs/${job._id}/applications`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Applications
                    </Link>

                    {job.status !== "CLOSED" && (
                      <button
                        onClick={() =>
                          handleCloseJob(job._id)
                        }
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Close offer
                      </button>
                    )}
                  </div>
                </div>

                {/* Required skills */}
                {job.extractedSkills?.requiredSkills
                  ?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Required skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.extractedSkills.requiredSkills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}