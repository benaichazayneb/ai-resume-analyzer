import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function RecruiterInterviewReport() {
  const { applicationId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // CHARGER LE RAPPORT
  // ============================================================

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/interviews/analysis/${applicationId}`
      );

      console.log(
        "📊 RAPPORT REÇU :",
        response.data
      );

      console.log(
        "👁️ COMPUTER VISION :",
        response.data.computerVision
      );

      setReport(response.data);
    } catch (err) {
      console.error(
        "Erreur récupération rapport :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de récupérer le rapport."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHARGEMENT INITIAL
  // ============================================================

  useEffect(() => {
    if (applicationId) {
      loadReport();
    }
  }, [applicationId]);

  // ============================================================
  // LANCER L'ANALYSE
  // ============================================================

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError("");

      const response = await api.post(
        `/interviews/analysis/${applicationId}`
      );

      console.log(
        "✅ ANALYSE TERMINÉE :",
        response.data
      );

      console.log(
        "👁️ COMPUTER VISION :",
        response.data.computerVision
      );

      setReport(response.data);
    } catch (err) {
      console.error(
        "Erreur analyse entretien :",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible d'analyser l'entretien."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-gray-500">
            Loading interview report...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // DONNÉES
  // ============================================================

  const analysis = report?.analysis;
  const transcription = report?.transcription;
  const computerVision = report?.computerVision;
  const video = report?.video;

  // ============================================================
  // VALEURS COMPUTER VISION
  // ============================================================

  const faceDetected =
    computerVision?.faceDetection?.detected;

  const detectionRate =
    computerVision?.faceDetection?.detectionRate;

  const faceVisibilityObservations =
    computerVision?.faceVisibility?.observations || [];

  const gazeObservations =
    computerVision?.gaze?.observations || [];

  const headMovementObservations =
    computerVision?.headMovement?.observations || [];

  const videoQualityObservations =
    computerVision?.videoQuality?.observations || [];

  const presenceObservations =
    computerVision?.presence?.observations || [];

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <Link
            to={-1}
            onClick={(event) => {
              event.preventDefault();
              window.history.back();
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to applications
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium text-blue-600">
              Recruiter space
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              AI Interview Report
            </h1>

            <p className="mt-2 text-gray-500">
              Complete analysis of the candidate interview
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-medium text-red-700">
              {error}
            </p>

            {!analysis && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {analyzing
                  ? "Analyzing..."
                  : "Analyze Interview"}
              </button>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* PAS D'ANALYSE */}
        {/* ================================================= */}

        {!analysis && !error && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Interview analysis not available
            </h2>

            <p className="mt-2 text-gray-500">
              The interview is completed but the AI report has
              not been generated yet.
            </p>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing
                ? "Generating report..."
                : "Generate AI Report"}
            </button>
          </div>
        )}

        {analysis && (
          <>

            {/* ================================================= */}
            {/* SCORE GLOBAL */}
            {/* ================================================= */}

            <div className="grid gap-6 md:grid-cols-4">

              <ScoreCard
                title="Overall Score"
                value={analysis.overallScore}
                primary
              />

              <ScoreCard
                title="Technical"
                value={analysis.technicalScore}
              />

              <ScoreCard
                title="Communication"
                value={analysis.communicationScore}
              />

              <ScoreCard
                title="Relevance"
                value={analysis.relevanceScore}
              />

            </div>

            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon="📝"
                title="Interview Summary"
              />

              <p className="mt-4 leading-7 text-gray-700">
                {analysis.summary ||
                  analysis.finalReportSummary ||
                  "No summary available."}
              </p>
            </section>

            {/* ================================================= */}
            {/* STRENGTHS / WEAKNESSES */}
            {/* ================================================= */}

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <ObservationCard
                title="Strengths"
                icon="✓"
                items={analysis.strengths}
                emptyMessage="No strengths identified."
                type="success"
              />

              <ObservationCard
                title="Weaknesses"
                icon="!"
                items={analysis.weaknesses}
                emptyMessage="No weaknesses identified."
                type="warning"
              />

            </div>

            {/* ================================================= */}
            {/* RECOMMENDATIONS */}
            {/* ================================================= */}

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon="💡"
                title="Recommendations"
              />

              <ObservationList
                items={analysis.recommendations}
                emptyMessage="No recommendations available."
              />
            </section>

            {/* ================================================= */}
            {/* COMMUNICATION */}
            {/* ================================================= */}

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon="🎙️"
                title="Communication Observations"
              />

              <ObservationList
                items={
                  analysis.communicationObservations
                }
                emptyMessage="No communication observations available."
              />
            </section>

            {/* ================================================= */}
            {/* SENTIMENT / TONAL */}
            {/* ================================================= */}

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <SectionTitle
                icon="💬"
                title="Sentiment and Tone Observations"
              />

              <p className="mb-4 text-sm text-gray-500">
                These observations describe the candidate's
                communication style and expressed tone during
                the interview.
              </p>

              <ObservationList
                items={
                  analysis.sentimentObservations
                }
                emptyMessage="No sentiment observations available."
              />
            </section>

            {/* ================================================= */}
            {/* COMPUTER VISION */}
            {/* ================================================= */}

            <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              {/* HEADER */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white p-6">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                      👁️
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Computer Vision Analysis
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Visual analysis of the interview recording
                      </p>
                    </div>

                  </div>

                  <ComputerVisionStatus
                    status={computerVision?.status}
                  />

                </div>

              </div>

              {/* CONTENU */}
              <div className="p-6">

                {!computerVision ? (

                  /* ================================================= */
                  /* COMPUTER VISION NON DISPONIBLE */
                  /* ================================================= */

                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                    <div className="flex items-start gap-3">

                      <span className="text-xl">
                        ⚠️
                      </span>

                      <div>

                        <h3 className="font-semibold text-yellow-900">
                          Computer Vision data not available
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-yellow-800">
                          The interview analysis was generated, but the
                          Computer Vision results were not returned by the
                          backend.
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <>

                    {/* ================================================= */}
                    {/* INDICATEURS PRINCIPAUX */}
                    {/* ================================================= */}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                      <InfoCard
                        title="Face Detection"
                        value={
                          faceDetected === true
                            ? "Face detected"
                            : faceDetected === false
                            ? "No face detected"
                            : "—"
                        }
                      />

                      <InfoCard
                        title="Detection Rate"
                        value={
                          detectionRate != null
                            ? `${Number(detectionRate).toFixed(2)}%`
                            : "—"
                        }
                      />

                      <InfoCard
                        title="Visual Presence"
                        value={
                          presenceObservations.length > 0
                            ? "Present"
                            : "—"
                        }
                      />

                      <InfoCard
                        title="Video Brightness"
                        value={
                          computerVision?.videoQuality?.brightness != null
                            ? Number(
                                computerVision.videoQuality.brightness
                              ).toFixed(2)
                            : "—"
                        }
                      />

                    </div>

                    {/* ================================================= */}
                    {/* RÉSUMÉ RAPIDE */}
                    {/* ================================================= */}

                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

                      <h3 className="font-semibold text-gray-900">
                        Visual Analysis
                      </h3>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Face Detection
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {faceDetected === true
                              ? "Detected"
                              : faceDetected === false
                              ? "Not detected"
                              : "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Detection Rate
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {detectionRate != null
                              ? `${Number(detectionRate).toFixed(2)}%`
                              : "Not available"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* OBSERVATIONS */}
                    {/* ================================================= */}

                    <div className="mt-8">

                      <h3 className="text-lg font-semibold text-gray-900">
                        Visual Observations
                      </h3>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">

                        <ComputerVisionObservationCard
                          icon="👤"
                          title="Face Visibility"
                          items={faceVisibilityObservations}
                        />

                        <ComputerVisionObservationCard
                          icon="📹"
                          title="Visual Presence"
                          items={presenceObservations}
                        />

                        <ComputerVisionObservationCard
                          icon="↔️"
                          title="Head Movement"
                          items={headMovementObservations}
                        />

                        <ComputerVisionObservationCard
                          icon="👀"
                          title="Gaze"
                          items={gazeObservations}
                        />

                        <ComputerVisionObservationCard
                          icon="💡"
                          title="Video Quality"
                          items={videoQualityObservations}
                        />

                      </div>

                    </div>

                    {/* ================================================= */}
                    {/* SYNTHÈSE VISUELLE */}
                    {/* ================================================= */}

                    <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">

                      <div className="flex items-center gap-2">

                        <span className="text-lg">
                          📌
                        </span>

                        <h3 className="font-semibold text-gray-900">
                          Visual Analysis Summary
                        </h3>

                      </div>

                      <p className="mt-3 leading-7 text-gray-700">
                        {computerVision.summary ||
                          "No visual analysis summary available."}
                      </p>

                    </div>

                    {/* ================================================= */}
                    {/* LIMITES */}
                    {/* ================================================= */}

                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">

                      <p className="text-xs leading-5 text-gray-500">

                        Computer Vision provides visual observations
                        based on the recorded interview video. The current
                        analysis detects facial presence, estimates face
                        detection rate, observes facial/head movements and
                        evaluates general video brightness.

                        {" "}

                        It does not determine emotions, stress, anxiety,
                        deception, personality, or mental state.

                        {" "}

                        Precise gaze direction is also not determined by
                        the current version.

                      </p>

                    </div>

                    {/* ================================================= */}
                    {/* ERREUR CV */}
                    {/* ================================================= */}

                    {computerVision.status === "FAILED" && (

                      <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">

                        <p className="font-semibold">
                          Computer Vision analysis failed.
                        </p>

                        {computerVision.error && (
                          <p className="mt-1">
                            {computerVision.error}
                          </p>
                        )}

                      </div>

                    )}

                  </>

                )}

              </div>

            </section>

            {/* ================================================= */}
            {/* VIDEO */}
            {/* ================================================= */}

            {video?.status === "UPLOADED" && (
              <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <SectionTitle
                  icon="🎥"
                  title="Interview Recording"
                />

                <div className="mt-5 grid gap-4 md:grid-cols-3">

                  <InfoCard
                    title="Status"
                    value="Uploaded"
                  />

                  <InfoCard
                    title="Duration"
                    value={
                      video.duration
                        ? formatDuration(
                            video.duration
                          )
                        : "—"
                    }
                  />

                  <InfoCard
                    title="Size"
                    value={
                      video.size
                        ? formatFileSize(
                            video.size
                          )
                        : "—"
                    }
                  />

                </div>

                <p className="mt-4 text-sm text-gray-500">
                  File:{" "}
                  {video.filename || "—"}
                </p>

              </section>
            )}

            {/* ================================================= */}
            {/* TRANSCRIPTION */}
            {/* ================================================= */}

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <SectionTitle
                icon="📄"
                title="Full Interview Transcript"
              />

              {transcription?.text ? (
                <div className="mt-5 max-h-[500px] overflow-y-auto rounded-lg bg-gray-50 p-5">

                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {transcription.text}
                  </p>

                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No transcript available.
                </p>
              )}

            </section>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="mt-8 flex justify-between">

              <button
                type="button"
                onClick={loadReport}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh Report
              </button>

              <Link
                to={-1}
                onClick={(event) => {
                  event.preventDefault();
                  window.history.back();
                }}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Back to Applications
              </Link>

            </div>

          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  title,
  value,
  primary = false,
}) {
  const score = Number(value);

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${
        primary
          ? "border-blue-200 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <div className="mt-3 flex items-end gap-1">

        <span
          className={`text-4xl font-bold ${
            primary
              ? "text-blue-600"
              : "text-gray-900"
          }`}
        >
          {Number.isFinite(score)
            ? score.toFixed(0)
            : "0"}
        </span>

        <span className="mb-1 text-gray-500">
          /100
        </span>

      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">

        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${Math.min(
              Math.max(score || 0, 0),
              100
            )}%`,
          }}
        />

      </div>
    </div>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  icon,
  title,
}) {
  return (
    <div className="flex items-center gap-3">

      <span className="text-xl">
        {icon}
      </span>

      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

    </div>
  );
}

/* ============================================================
   COMPUTER VISION STATUS
============================================================ */

function ComputerVisionStatus({
  status,
}) {
  if (status === "COMPLETED") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
        ✓ Analysis completed
      </span>
    );
  }

  if (status === "ANALYZING") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
        Analysis in progress
      </span>
    );
  }

  if (status === "FAILED") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
        Analysis failed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
      Not available
    </span>
  );
}

/* ============================================================
   COMPUTER VISION OBSERVATION CARD
============================================================ */

function ComputerVisionObservationCard({
  icon,
  title,
  items,
}) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>

        <h4 className="font-semibold text-gray-900">
          {title}
        </h4>

      </div>

      <ul className="mt-4 space-y-3">

        {items.map(
          (item, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm leading-6 text-gray-700"
            >

              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />

              <span>
                {item}
              </span>

            </li>
          )
        )}

      </ul>

    </div>
  );
}

/* ============================================================
   OBSERVATION CARD
============================================================ */

function ObservationCard({
  title,
  icon,
  items,
  emptyMessage,
  type,
}) {
  const styles =
    type === "success"
      ? "border-green-200 bg-green-50"
      : "border-yellow-200 bg-yellow-50";

  const iconStyles =
    type === "success"
      ? "bg-green-600"
      : "bg-yellow-500";

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${styles}`}
    >

      <div className="flex items-center gap-3">

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${iconStyles}`}
        >
          {icon}
        </span>

        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

      </div>

      <ObservationList
        items={items}
        emptyMessage={emptyMessage}
      />

    </div>
  );
}

/* ============================================================
   OBSERVATION LIST
============================================================ */

function ObservationList({
  items,
  emptyMessage = "No information available.",
}) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return (
      <p className="mt-4 text-sm text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">

      {items.map(
        (item, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm leading-6 text-gray-700"
          >

            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />

            <span>
              {item}
            </span>

          </li>
        )
      )}

    </ul>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  title,
  value,
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatDuration(seconds) {
  const totalSeconds =
    Number(seconds);

  if (
    !Number.isFinite(totalSeconds)
  ) {
    return "—";
  }

  const minutes =
    Math.floor(totalSeconds / 60);

  const remainingSeconds =
    Math.floor(totalSeconds % 60);

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
}

function formatFileSize(bytes) {
  const value = Number(bytes);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  const mb =
    value / (1024 * 1024);

  return `${mb.toFixed(1)} MB`;
}