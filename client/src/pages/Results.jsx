import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiArrowUpRight,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";

import * as analysisService from "../services/analysisService";
import ScoreGauge from "../components/ScoreGauge";

export default function Results() {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    analysisService
      .getAnalysisById(id)
      .then((res) => {
        if (!cancelled) {
          setAnalysis(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Could not load this analysis."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#6D5DFB] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-400">
            Loading your match results...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FiAlertCircle className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-[#111111]">
            Unable to load results
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <Link
            to="/history"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to applications
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const score = Number(analysis.matchScore || 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#111111]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6D5DFB]">
            Application match
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
            Your profile match
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Here's how your resume aligns with this job opportunity.
          </p>
        </div>
      </div>


      {/* ================================================= */}
      {/* MATCH SCORE */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

        <div className="grid lg:grid-cols-[280px_1fr]">

          {/* Score */}
          <div className="flex flex-col items-center justify-center border-b border-gray-100 bg-[#F8F8FA] px-8 py-10 lg:border-b-0 lg:border-r">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              AI Match
            </p>

            <div className="mt-5">
              <ScoreGauge score={score} />
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Profile compatibility
            </p>

          </div>


          {/* Explanation */}
          <div className="p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
                <FiBriefcase className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#111111]">
                  Match overview
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Your resume has been compared with the requirements
                  of this opportunity.
                </p>
              </div>

            </div>


            {/* Score bar */}
            <div className="mt-8">

              <div className="flex items-center justify-between text-sm">

                <span className="font-medium text-gray-700">
                  Profile alignment
                </span>

                <span className="font-semibold text-[#6D5DFB]">
                  {score.toFixed(1)}%
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#6D5DFB] transition-all"
                  style={{
                    width: `${Math.min(score, 100)}%`,
                  }}
                />
              </div>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFB] p-4">

                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Matched skills
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#111111]">
                  {analysis.matchedSkills?.length || 0}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Skills found in your profile
                </p>

              </div>


              <div className="rounded-xl border border-gray-100 bg-[#FAFAFB] p-4">

                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Missing skills
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#111111]">
                  {analysis.missingSkills?.length || 0}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Skills not detected in your CV
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>


      {/* ================================================= */}
      {/* SKILLS */}
      {/* ================================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Matched */}
        <div className="rounded-2xl border border-gray-200 bg-white p-7">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheck className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-semibold text-[#111111]">
                Matched skills
              </h2>

              <p className="text-xs text-gray-400">
                Skills aligned with the opportunity
              </p>
            </div>

          </div>


          <div className="mt-6 flex flex-wrap gap-2">

            {analysis.matchedSkills?.length ? (
              analysis.matchedSkills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                No matching skills detected.
              </p>
            )}

          </div>

        </div>


        {/* Missing */}
        <div className="rounded-2xl border border-gray-200 bg-white p-7">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiAlertCircle className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-semibold text-[#111111]">
                Skills to develop
              </h2>

              <p className="text-xs text-gray-400">
                Skills not detected in your resume
              </p>
            </div>

          </div>


          <div className="mt-6 flex flex-wrap gap-2">

            {analysis.missingSkills?.length ? (
              analysis.missingSkills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                No missing skills detected.
              </p>
            )}

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* AI SUMMARY */}
      {/* ================================================= */}

      {analysis.professionalSummary && (
        <div className="rounded-2xl bg-[#111111] p-7 text-white">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6D5DFB] text-xs font-bold">
              AI
            </div>

            <div>
              <p className="text-sm font-semibold">
                TalentLink AI
              </p>

              <p className="text-[10px] text-gray-400">
                Profile insights
              </p>
            </div>

          </div>


          <h2 className="mt-6 text-xl font-semibold">
            Profile summary
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-gray-400">
            {analysis.professionalSummary}
          </p>

        </div>
      )}


      {/* ================================================= */}
      {/* RECOMMENDATIONS */}
      {/* ================================================= */}

      {analysis.recommendations?.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-7">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-[#111111]">
                Profile recommendations
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Suggestions based on your current profile
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
              <FiArrowUpRight className="h-4 w-4" />
            </div>

          </div>


          <div className="mt-6 space-y-3">

            {analysis.recommendations.map(
              (recommendation, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl bg-[#F8F8FA] p-4"
                >

                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#6D5DFB]">
                    {index + 1}
                  </div>

                  <p className="text-sm leading-6 text-gray-600">
                    {recommendation}
                  </p>

                </div>
              )
            )}

          </div>

        </div>
      )}


      {/* ================================================= */}
      {/* BOTTOM ACTIONS */}
      {/* ================================================= */}

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#6D5DFB]">
            <FiFileText className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111111]">
              Ready to explore opportunities?
            </p>

            <p className="text-xs text-gray-400">
              Browse available jobs and submit your applications.
            </p>
          </div>

        </div>


        <Link
          to="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Browse jobs
          <FiArrowUpRight className="h-4 w-4" />
        </Link>

      </div>

    </div>
  );
}