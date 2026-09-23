import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import * as applicationService from "../services/applicationService";

export default function RecruiterApplications() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  const [actionLoading, setActionLoading] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState({});

  const [interviewAnalysis, setInterviewAnalysis] = useState({});

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // CHARGER LES CANDIDATURES
  // =====================================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobResponse, applicationResponse] =
        await Promise.all([
          api.get(`/jobs/${jobId}`),
          applicationService.getApplicationsByJob(jobId),
        ]);

      setJob(jobResponse.data.data);
      setApplications(applicationResponse.data || []);
    } catch (err) {
      console.error("Error loading applications:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  // =====================================================
  // MATCHING
  // =====================================================

  const handleRunMatching = async () => {
    try {
      setMatching(true);
      setError("");
      setMessage("");

      const response =
        await applicationService.runMatchingForJob(jobId);

      setMessage(
        response.message ||
          `Matching completed. Processed: ${
            response.data?.processed ?? 0
          }`
      );

      await loadApplications();
    } catch (err) {
      console.error("Error running matching:", err);

      setError(
        err.response?.data?.message ||
          "Unable to run matching."
      );
    } finally {
      setMatching(false);
    }
  };

  // =====================================================
  // METTRE À JOUR LE STATUT
  // =====================================================

  const handleUpdateStatus = async (
    applicationId,
    status
  ) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [applicationId]: true,
      }));

      setError("");
      setMessage("");

      const response = await api.patch(
        `/applications/${applicationId}/status`,
        { status }
      );

      setMessage(
        response.data?.message ||
          (status === "SHORTLISTED"
            ? "Candidate shortlisted successfully."
            : "Candidate marked as not selected.")
      );

      await loadApplications();
    } catch (err) {
      console.error(
        "Error updating candidate status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update candidate status."
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [applicationId]: false,
      }));
    }
  };

  // =====================================================
  // ENVOYER INVITATION ENTRETIEN
  // =====================================================

  const handleSendInvitation = async (applicationId) => {
    const confirmed = window.confirm(
      "Send an interview invitation to this candidate?"
    );

    if (!confirmed) return;

    try {
      setActionLoading((prev) => ({
        ...prev,
        [applicationId]: true,
      }));

      setError("");
      setMessage("");

      const response = await api.post(
        `/applications/${applicationId}/interview-invitation`
      );

      setMessage(
        response.data?.message ||
          "Interview invitation sent successfully."
      );

      await loadApplications();
    } catch (err) {
      console.error(
        "Error sending interview invitation:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to send interview invitation."
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [applicationId]: false,
      }));
    }
  };

  // =====================================================
  // ANALYSER L'ENTRETIEN AVEC GEMINI
  // =====================================================

  const handleAnalyzeInterview = async (applicationId) => {
    try {
      setAnalysisLoading((prev) => ({
        ...prev,
        [applicationId]: true,
      }));

      setError("");
      setMessage("");

      const response = await api.post(
        `/interviews/analysis/${applicationId}`
      );

      const analysis = response.data?.analysis;

      if (!analysis) {
        throw new Error(
          "No analysis was returned by the server."
        );
      }

      setInterviewAnalysis((prev) => ({
        ...prev,
        [applicationId]: analysis,
      }));

      setMessage(
        response.data?.message ||
          "Interview analysis completed successfully."
      );
    } catch (err) {
      console.error(
        "Error analyzing interview:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to analyze the interview."
      );
    } finally {
      setAnalysisLoading((prev) => ({
        ...prev,
        [applicationId]: false,
      }));
    }
  };

  // =====================================================
  // RÉCUPÉRER UNE ANALYSE EXISTANTE
  // =====================================================

  const loadInterviewAnalysis = async (applicationId) => {
    try {
      const response = await api.get(
        `/interviews/analysis/${applicationId}`
      );

      const analysis = response.data?.analysis;

      if (analysis) {
        setInterviewAnalysis((prev) => ({
          ...prev,
          [applicationId]: analysis,
        }));
      }
    } catch (err) {
      // 404 signifie simplement que l'analyse n'existe
      // pas encore. On ne bloque pas la page.
      if (err.response?.status !== 404) {
        console.error(
          "Error loading interview analysis:",
          err
        );
      }
    }
  };

  // =====================================================
  // CHARGER LES ANALYSES EXISTANTES
  // =====================================================

  useEffect(() => {
    const loadExistingAnalyses = async () => {
      const completedApplications =
        applications.filter(
          (application) =>
            application.status ===
            "INTERVIEW_COMPLETED"
        );

      if (completedApplications.length === 0) {
        return;
      }

      await Promise.all(
        completedApplications.map((application) =>
          loadInterviewAnalysis(application._id)
        )
      );
    };

    if (!loading) {
      loadExistingAnalyses();
    }
  }, [applications, loading]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading applications...
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* Retour dashboard */}
      <Link
        to="/recruiter/dashboard"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-blue-600">
            Recruiter space
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Applications
          </h1>

          <p className="mt-2 text-gray-600">
            {job?.title || "Job offer"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunMatching}
          disabled={
            matching || applications.length === 0
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {matching
            ? "Matching..."
            : "Run Matching"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Applications */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Received applications
          </h2>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {applications.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No applications received yet.
          </p>
        ) : (
          <div className="space-y-4">

            {applications.map((application) => {
              const score =
                application.matching?.overallScore ??
                application.matching?.score ??
                null;

              const candidate =
                application.candidateId;

              const status =
                application.status;

              const analysis =
                interviewAnalysis[
                  application._id
                ];

              const isBusy =
                Boolean(
                  actionLoading[
                    application._id
                  ]
                ) || matching;

              const hasMatching =
                score !== null &&
                score !== undefined;

              const isAnalyzing =
                Boolean(
                  analysisLoading[
                    application._id
                  ]
                );

              return (
                <div
                  key={application._id}
                  className="rounded-lg border border-gray-200 p-5"
                >

                  {/* ================================================= */}
                  {/* CANDIDAT + STATUS */}
                  {/* ================================================= */}

                  <div className="flex flex-col justify-between gap-4 sm:flex-row">

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {candidate?.name ||
                          "Candidate"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {candidate?.email ||
                          "No email"}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Applied:{" "}
                        {application.createdAt
                          ? new Date(
                              application.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        {status}
                      </span>

                      {hasMatching && (
                        <p className="text-2xl font-bold text-blue-600">
                          {Number(score).toFixed(1)}%
                        </p>
                      )}

                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* MATCHING NON EFFECTUÉ */}
                  {/* ================================================= */}

                  {status ===
                    "PENDING_MATCHING" && (
                    <p className="mt-4 text-sm text-gray-500">
                      Matching has not been run
                      for this application.
                    </p>
                  )}

                  {/* ================================================= */}
                  {/* MATCHED SKILLS */}
                  {/* ================================================= */}

                  {application.matching
                    ?.matchedSkills?.length >
                    0 && (
                    <div className="mt-4">

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

                  {/* ================================================= */}
                  {/* MISSING SKILLS */}
                  {/* ================================================= */}

                  {application.matching
                    ?.missingSkills?.length >
                    0 && (
                    <div className="mt-4">

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

                  {/* ================================================= */}
                  {/* ACTIONS RECRUTEUR */}
                  {/* ================================================= */}

                  {hasMatching && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">

                      {/* SHORTLIST / NOT SELECTED */}

                      {status !==
                        "SHORTLISTED" &&
                        status !==
                          "INTERVIEW_INVITED" &&
                        status !==
                          "INTERVIEW_COMPLETED" &&
                        status !== "HIRED" &&
                        status !==
                          "NOT_SELECTED" &&
                        status !== "REJECTED" && (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleUpdateStatus(
                                  application._id,
                                  "SHORTLISTED"
                                )
                              }
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading[
                                application._id
                              ]
                                ? "Please wait..."
                                : "Shortlist"}
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleUpdateStatus(
                                  application._id,
                                  "NOT_SELECTED"
                                )
                              }
                              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Not selected
                            </button>
                          </>
                        )}

                      {/* INVITATION */}

                      {status ===
                        "SHORTLISTED" && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleSendInvitation(
                              application._id
                            )
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionLoading[
                            application._id
                          ]
                            ? "Sending..."
                            : "Send Interview Invitation"}
                        </button>
                      )}

                      {/* ENTRETIEN INVITÉ */}

                      {status ===
                        "INTERVIEW_INVITED" && (
                        <p className="text-sm font-medium text-green-700">
                          Interview invitation sent.
                        </p>
                      )}

                      {/* ================================================= */}
                      {/* ENTRETIEN TERMINÉ */}
                      {/* ================================================= */}

                      {status ===
                        "INTERVIEW_COMPLETED" && (
                        <div className="flex flex-wrap items-center gap-3">

                          {!analysis && (
                            <button
                              type="button"
                              disabled={isAnalyzing}
                              onClick={() =>
                                handleAnalyzeInterview(
                                  application._id
                                )
                              }
                              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isAnalyzing
                                ? "Analyzing..."
                                : "Analyze Interview"}
                            </button>
                          )}

                          {analysis &&
                            analysis.status ===
                              "COMPLETED" && (
                              <span className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                                Interview analyzed
                              </span>
                            )}

                        </div>
                      )}

                      {/* NOT SELECTED */}

                      {status ===
                        "NOT_SELECTED" && (
                        <p className="text-sm text-gray-500">
                          This candidate was
                          not selected.
                        </p>
                      )}

                    </div>
                  )}

                  {/* ================================================= */}
                  {/* ANALYSE IA GEMINI */}
                  {/* ================================================= */}

                  {analysis &&
                    analysis.status ===
                      "COMPLETED" && (
                      <div className="mt-6 border-t border-gray-200 pt-6">

                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">
                              AI Interview Analysis
                            </h4>

                            <p className="mt-1 text-sm text-gray-500">
                              Analysis generated from
                              the candidate's interview
                              answers.
                            </p>
                          </div>

                          {analysis.analyzedAt && (
                            <p className="text-xs text-gray-400">
                              Analyzed on{" "}
                              {new Date(
                                analysis.analyzedAt
                              ).toLocaleString()}
                            </p>
                          )}

                        </div>

                        {/* ============================= */}
                        {/* SCORES */}
                        {/* ============================= */}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                          {/* Overall */}

                          <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-gray-600">
                              Overall score
                            </p>

                            <p className="mt-1 text-3xl font-bold text-blue-700">
                              {analysis.overallScore ??
                                0}
                              /100
                            </p>
                          </div>

                          {/* Technical */}

                          <div className="rounded-lg bg-purple-50 p-4">
                            <p className="text-sm text-gray-600">
                              Technical
                            </p>

                            <p className="mt-1 text-3xl font-bold text-purple-700">
                              {analysis.technicalScore ??
                                0}
                              /100
                            </p>
                          </div>

                          {/* Communication */}

                          <div className="rounded-lg bg-green-50 p-4">
                            <p className="text-sm text-gray-600">
                              Communication
                            </p>

                            <p className="mt-1 text-3xl font-bold text-green-700">
                              {analysis.communicationScore ??
                                0}
                              /100
                            </p>
                          </div>

                          {/* Relevance */}

                          <div className="rounded-lg bg-orange-50 p-4">
                            <p className="text-sm text-gray-600">
                              Relevance
                            </p>

                            <p className="mt-1 text-3xl font-bold text-orange-700">
                              {analysis.relevanceScore ??
                                0}
                              /100
                            </p>
                          </div>

                        </div>

                        {/* ============================= */}
                        {/* SUMMARY */}
                        {/* ============================= */}

                        {analysis.summary && (
                          <div className="mt-6">

                            <h5 className="font-semibold text-gray-800">
                              Summary
                            </h5>

                            <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                              {analysis.summary}
                            </p>

                          </div>
                        )}

                        {/* ============================= */}
                        {/* STRENGTHS */}
                        {/* ============================= */}

                        {analysis.strengths?.length >
                          0 && (
                          <div className="mt-6">

                            <h5 className="font-semibold text-gray-800">
                              Strengths
                            </h5>

                            <ul className="mt-2 space-y-2">

                              {analysis.strengths.map(
                                (
                                  strength,
                                  index
                                ) => (
                                  <li
                                    key={index}
                                    className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700"
                                  >
                                    • {strength}
                                  </li>
                                )
                              )}

                            </ul>
                          </div>
                        )}

                        {/* ============================= */}
                        {/* WEAKNESSES */}
                        {/* ============================= */}

                        {analysis.weaknesses?.length >
                          0 && (
                          <div className="mt-6">

                            <h5 className="font-semibold text-gray-800">
                              Areas for improvement
                            </h5>

                            <ul className="mt-2 space-y-2">

                              {analysis.weaknesses.map(
                                (
                                  weakness,
                                  index
                                ) => (
                                  <li
                                    key={index}
                                    className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
                                  >
                                    • {weakness}
                                  </li>
                                )
                              )}

                            </ul>
                          </div>
                        )}

                        {/* ============================= */}
                        {/* RECOMMENDATIONS */}
                        {/* ============================= */}

                        {analysis.recommendations
                          ?.length > 0 && (
                          <div className="mt-6">

                            <h5 className="font-semibold text-gray-800">
                              Recommendations
                            </h5>

                            <ul className="mt-2 space-y-2">

                              {analysis.recommendations.map(
                                (
                                  recommendation,
                                  index
                                ) => (
                                  <li
                                    key={index}
                                    className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700"
                                  >
                                    •{" "}
                                    {
                                      recommendation
                                    }
                                  </li>
                                )
                              )}

                            </ul>
                          </div>
                        )}

                      </div>
                    )}

                  {/* ================================================= */}
                  {/* ANALYSE EN COURS */}
                  {/* ================================================= */}

                  {analysis &&
                    analysis.status ===
                      "ANALYZING" && (
                      <div className="mt-6 rounded-lg bg-purple-50 p-4 text-sm text-purple-700">
                        Gemini is analyzing this
                        interview...
                      </div>
                    )}

                  {/* ================================================= */}
                  {/* ANALYSE ÉCHOUÉE */}
                  {/* ================================================= */}

                  {analysis &&
                    analysis.status === "FAILED" && (
                      <div className="mt-6 rounded-lg bg-red-50 p-4">

                        <p className="text-sm text-red-700">
                          The interview analysis
                          failed.
                        </p>

                        <button
                          type="button"
                          disabled={isAnalyzing}
                          onClick={() =>
                            handleAnalyzeInterview(
                              application._id
                            )
                          }
                          className="mt-3 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          {isAnalyzing
                            ? "Analyzing..."
                            : "Retry Analysis"}
                        </button>

                      </div>
                    )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}