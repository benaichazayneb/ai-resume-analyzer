import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as analysisService from "../services/analysisService";
import ScoreGauge from "../components/ScoreGauge";

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analysisService
      .getAnalyses()
      .then((res) => setAnalyses(res.data || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load your analyses."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-20 text-center text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="py-20 text-center text-sm text-red-600">{error}</p>;

  const latest = analyses[0];

  if (!latest) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">No analyses yet</h1>
        <p className="mt-2 text-sm text-slate-500">
          Upload your resume and paste a job description to get your first match score.
        </p>
        <Link
          to="/upload-resume"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="flex flex-col items-center gap-6 rounded-lg border border-slate-200 bg-white p-8 sm:flex-row sm:justify-between">
        <ScoreGauge score={latest.matchScore} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-slate-500">Your most recent analysis</p>
          <Link
            to={`/results/${latest._id}`}
            className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
          >
            View full results
          </Link>
        </div>
      </div>

      <Link to="/analyze" className="inline-block text-sm text-slate-500 underline">
        Run a new analysis
      </Link>
    </div>
  );
}
