
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import * as jobService from "../services/jobService";
import * as applicationService from "../services/applicationService";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resumeId = localStorage.getItem(
    "latestResumeId"
  );

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await jobService.getJobById(id);

        setJob(response.data);
      } catch (err) {
        console.error("Error loading job:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this job offer."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleApply = async () => {
    setError("");
    setMessage("");

    // Pas de CV : aller à l'upload en gardant le jobId.
    if (!resumeId) {
      navigate(`/upload-resume?jobId=${id}`);
      return;
    }

    try {
      setApplying(true);

      const response =
        await applicationService.createApplication(
          id,
          resumeId
        );

      setMessage(
        response.message ||
          "Application submitted successfully."
      );
    } catch (err) {
      console.error("Application error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to submit your application."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Job offer not found."}
        </div>

        <Link
          to="/jobs"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to="/jobs"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to jobs
      </Link>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {job.title}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Published{" "}
              {job.publishedAt
                ? new Date(
                    job.publishedAt
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <span className="h-fit rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {job.status}
          </span>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Job Description
          </h2>

          <p className="mt-3 whitespace-pre-line text-gray-600">
            {job.description}
          </p>
        </div>

        {job.extractedSkills?.requiredSkills?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Required Skills
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
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

        {message && (
          <div className="mt-8 rounded-lg bg-green-50 p-4 text-green-700">
            {message}

            <div className="mt-3">
              <Link
                to="/applications"
                className="font-medium underline"
              >
                View my applications
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || !!message}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {applying
              ? "Submitting..."
              : message
              ? "Application submitted"
              : resumeId
              ? "Apply with my CV"
              : "Upload CV and Apply"}
          </button>

          {!resumeId && (
            <Link
              to={`/upload-resume?jobId=${id}`}
              className="rounded-lg border border-blue-600 px-6 py-3 text-center font-medium text-blue-600 hover:bg-blue-50"
            >
              Upload CV
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}