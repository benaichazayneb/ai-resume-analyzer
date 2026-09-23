import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as applicationService from "../services/applicationService";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response =
          await applicationService.getMyApplications();

        setApplications(response.data || []);
      } catch (err) {
        console.error("Error loading applications:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your applications."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        My Applications
      </h1>

      <p className="mt-2 text-gray-600">
        Follow the status of your job applications.
      </p>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            You have not applied to any job yet.
          </p>

          <Link
            to="/jobs"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Browse job offers
          </Link>
        </div>
      )}

      {!error && applications.length > 0 && (
        <div className="mt-8 space-y-4">
          {applications.map((application) => {
            const score =
              application.matching?.overallScore;

            return (
              <div
                key={application._id}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {application.jobId?.title ||
                        "Job offer"}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Applied on{" "}
                      {application.createdAt
                        ? new Date(
                            application.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {application.status}
                  </span>
                </div>

                {score !== null &&
                  score !== undefined && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500">
                        Matching score
                      </p>

                      <p className="mt-1 text-3xl font-bold text-blue-600">
                        {Number(score).toFixed(1)}%
                      </p>
                    </div>
                  )}

                {application.status ===
                  "PENDING_MATCHING" && (
                  <p className="mt-5 text-sm text-gray-500">
                    Your application has been received.
                  </p>
                )}

                {application.matching
                  ?.matchedSkills?.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Matched skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {application.matching.matchedSkills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {application.matching
                  ?.missingSkills?.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Missing skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {application.matching.missingSkills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}