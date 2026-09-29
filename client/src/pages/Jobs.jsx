import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as jobService from "../services/jobService";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);

        const response = await jobService.getJobs();

        setJobs(response.data || []);
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

    loadJobs();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading job offers...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Available Job Offers
        </h1>

        <p className="mt-2 text-gray-600">
          Browse published job offers and apply with your resume.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && jobs.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            No published job offers are available.
          </p>
        </div>
      )}

      {!error && jobs.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {job.title}
                </h2>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  PUBLISHED
                </span>
              </div>

              <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm text-gray-600">
                {job.description}
              </p>

              {job.extractedSkills?.requiredSkills?.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Required skills
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.extractedSkills.requiredSkills.map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/jobs/${job._id}`}
                className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View offer
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}