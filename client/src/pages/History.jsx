import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import * as analysisService from "../services/analysisService";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analysisService
      .getAnalyses()
      .then((res) => setAnalyses(res.data || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load history."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await analysisService.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this analysis.");
    }
  };

  if (loading) return <p className="py-20 text-center text-sm text-slate-400">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Analysis history</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {analyses.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No analyses yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {analyses.map((a) => (
            <div key={a._id} className="flex items-center justify-between px-4 py-3">
              <Link to={`/results/${a._id}`} className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {a.jobDescriptionId?.title || "Untitled role"}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </Link>
              <span className="mx-4 text-sm font-semibold text-slate-900">{a.matchScore}%</span>
              <button
                type="button"
                onClick={() => handleDelete(a._id)}
                className="text-slate-400 hover:text-red-600"
                aria-label="Delete analysis"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
