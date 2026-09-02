import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as jobService from "../services/jobService";
import * as analysisService from "../services/analysisService";

export default function Analyze() {
  const navigate = useNavigate();
  const resumeId = localStorage.getItem("latestResumeId");

  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeId) return;

    setLoading(true);
    setError(null);
    try {
      const jobRes = await jobService.createJob(form);
      const jobId = jobRes.data._id;

      const analysisRes = await analysisService.createAnalysis({
        resumeId,
        jobDescriptionId: jobId,
      });

      navigate(`/results/${analysisRes.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!resumeId) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Paste a job description</h1>
        <p className="mt-2 text-sm text-slate-500">
          Upload a resume first so we know what to compare the job against.
        </p>
        <Link
          to="/upload-resume"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Upload resume
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Paste a job description</h1>
      <p className="mt-1 text-sm text-slate-500">
        We'll compare it against the resume you just uploaded.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Job title
          </label>
          <input
            id="title"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Full Stack Developer"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Job description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={10}
            value={form.description}
            onChange={handleChange}
            placeholder="Paste the full job posting here…"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Analyzing…" : "Analyze match"}
        </button>
      </form>
    </div>
  );
}
