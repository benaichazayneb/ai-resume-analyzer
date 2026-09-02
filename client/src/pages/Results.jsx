import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as analysisService from "../services/analysisService";
import ScoreGauge from "../components/ScoreGauge";
import ScoreBreakdown from "../components/ScoreBreakdown";

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
        if (!cancelled) setAnalysis(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Could not load this analysis.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="py-20 text-center text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="py-20 text-center text-sm text-red-600">{error}</p>;
  if (!analysis) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-8 rounded-lg border border-slate-200 bg-white p-8 sm:flex-row sm:items-start">
        <ScoreGauge score={analysis.matchScore} />
        <ScoreBreakdown analysis={analysis} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-medium text-slate-900">Matched skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.matchedSkills?.length ? (
              analysis.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700"
                >
                  {s}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">None detected.</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-medium text-slate-900">Missing skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.missingSkills?.length ? (
              analysis.missingSkills.map((s) => (
                <span key={s} className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">None — great coverage.</p>
            )}
          </div>
        </div>
      </div>

      {analysis.professionalSummary && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-medium text-slate-900">Professional summary</h2>
          <p className="mt-2 text-sm text-slate-600">{analysis.professionalSummary}</p>
        </div>
      )}

      {analysis.recommendations?.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-medium text-slate-900">Recommendations</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {analysis.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {(analysis.interviewQuestions?.technical?.length > 0 ||
        analysis.interviewQuestions?.behavioral?.length > 0) && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-medium text-slate-900">Technical questions</h2>
            <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {analysis.interviewQuestions?.technical?.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-medium text-slate-900">Behavioral questions</h2>
            <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
              {analysis.interviewQuestions?.behavioral?.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Link to="/history" className="inline-block text-sm text-slate-500 underline">
        Back to history
      </Link>
    </div>
  );
}
