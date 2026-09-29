import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiUsers,
  FiVideo,
  FiUserCheck,
  FiPlus,
  FiRefreshCw,
  FiArrowUpRight,
  FiMoreHorizontal,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

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

  const statistics = useMemo(() => {
    const published = jobs.filter(
      (job) => job.status === "PUBLISHED"
    ).length;

    const closed = jobs.filter(
      (job) => job.status === "CLOSED"
    ).length;

    const draft = jobs.filter(
      (job) => job.status !== "PUBLISHED" && job.status !== "CLOSED"
    ).length;

    return {
      total: jobs.length,
      published,
      closed,
      draft,
    };
  }, [jobs]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "PUBLISHED":
        return {
          wrapper: "bg-green-50 text-green-700",
          dot: "bg-green-500",
        };

      case "CLOSED":
        return {
          wrapper: "bg-gray-100 text-gray-600",
          dot: "bg-gray-400",
        };

      default:
        return {
          wrapper: "bg-amber-50 text-amber-700",
          dot: "bg-amber-500",
        };
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* ================================================= */}
      {/* HEADER                                            */}
      {/* ================================================= */}

      <section className="mb-8">

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6D5DFB]" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Recruitment workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#111111] sm:text-4xl">
              Recruitment overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage your opportunities and keep track of your recruitment
              activity from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={fetchJobs}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

            <Link
              to="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D5DFB]"
            >
              <FiPlus className="h-4 w-4" />
              Create job
            </Link>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* KPI CARDS                                         */}
      {/* ================================================= */}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total jobs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">

          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D5DFB]/10 text-[#6D5DFB]">
              <FiBriefcase className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              All time
            </span>

          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight">
            {statistics.total}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Job opportunities
          </p>

        </div>


        {/* Published */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">

          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheckCircle className="h-5 w-5" />
            </div>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-600">
              Active
            </span>

          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight">
            {statistics.published}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Published positions
          </p>

        </div>


        {/* Draft */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">

          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiClock className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              Pending
            </span>

          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight">
            {statistics.draft}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Draft / pending offers
          </p>

        </div>


        {/* Closed */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">

          <div className="flex items-start justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <FiXCircle className="h-5 w-5" />
            </div>

            <span className="text-xs font-medium text-gray-400">
              Archived
            </span>

          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight">
            {statistics.closed}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Closed positions
          </p>

        </div>

      </section>
      {/* ================================================= */}
      {/* JOB OFFERS                                        */}
      {/* ================================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white">

        {/* Section header */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-3">

              <h2 className="text-lg font-semibold">
                Job opportunities
              </h2>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                {jobs.length}
              </span>

            </div>
            <p className="mt-1 text-sm text-gray-400">
              Manage your published and closed opportunities.
            </p>
          </div>

          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-[#111111]"
          >
            <FiPlus className="h-4 w-4" />
            Add job
          </Link>

        </div>


        {/* Loading */}
        {loading && (
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#6D5DFB]/10">
              <FiRefreshCw className="h-4 w-4 animate-spin text-[#6D5DFB]" />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Loading your opportunities...
            </p>

          </div>
        )}


        {/* Error */}
        {!loading && error && (
          <div className="p-6">

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

              <p className="text-sm font-medium text-red-700">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={fetchJobs}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm"
              >
                Try again
              </button>

            </div>

          </div>
        )}


        {/* Empty */}
        {!loading && !error && jobs.length === 0 && (
          <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6D5DFB]/10 text-[#6D5DFB]">
              <FiBriefcase className="h-6 w-6" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              No job opportunities yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Create your first job opportunity to start receiving candidates
              and using TalentLink AI matching.
            </p>

            <Link
              to="/recruiter/jobs/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6D5DFB]"
            >
              <FiPlus className="h-4 w-4" />
              Create first job
            </Link>

          </div>
        )}


        {/* Jobs */}
        {!loading && !error && jobs.length > 0 && (
          <div className="divide-y divide-gray-100">

            {jobs.map((job) => {
              const status = getStatusStyle(job.status);

              return (
                <div
                  key={job._id}
                  className="group px-6 py-6 transition hover:bg-gray-50/70"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

                    {/* Job information */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-base font-semibold text-[#111111]">
                          {job.title}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.wrapper}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />

                          {job.status}
                        </span>

                      </div>

                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                        {job.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400">

                        <span>
                          Created{" "}
                          {job.createdAt
                            ? new Date(
                                job.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </span>

                        {job.extractedSkills?.requiredSkills?.length > 0 && (
                          <span>
                            {job.extractedSkills.requiredSkills.length} required skills
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Skills */}
                    {job.extractedSkills?.requiredSkills?.length > 0 && (
                      <div className="hidden max-w-xs xl:block">

                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                          Key skills
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                          {job.extractedSkills.requiredSkills
                            .slice(0, 4)
                            .map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full bg-[#F6F6F8] px-2.5 py-1 text-[11px] font-medium text-gray-600"
                              >
                                {skill}
                              </span>
                            ))}

                          {job.extractedSkills.requiredSkills.length > 4 && (
                            <span className="rounded-full bg-[#F6F6F8] px-2.5 py-1 text-[11px] font-medium text-gray-400">
                              +
                              {job.extractedSkills.requiredSkills.length - 4}
                            </span>
                          )}

                        </div>

                      </div>
                    )}


                    {/* Actions */}
                    <div className="flex items-center gap-2">

                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#6D5DFB]"
                      >
                        View applications
                        <FiArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      {job.status !== "CLOSED" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCloseJob(job._id)
                          }
                          title="Close job"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 sm:flex"
                        title="More options"
                      >
                        <FiMoreHorizontal className="h-4 w-4" />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>


      {/* ================================================= */}
      {/* FOOTER INSIGHT                                    */}
      {/* ================================================= */}

      <div className="mt-6 flex flex-col gap-2 pb-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

        <p>
          TalentLink AI · Recruitment workspace
        </p>

      </div>

    </div>
  );
}