
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    keywords: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please enter a job title and description.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the job offer as a draft
      const response = await api.post("/jobs", {
        title: form.title.trim(),
        description: form.description.trim(),
      });

      const job = response.data.data;

      if (!job?._id && !job?.id) {
        throw new Error("The job was created but its ID was not returned.");
      }

      const jobId = job._id || job.id;

      // 2. Publish only if the recruiter clicked Publish Offer
      if (publish) {
        await api.patch(`/jobs/${jobId}/publish`);

        setSuccess("Job offer created and published successfully!");
      } else {
        setSuccess("Job offer saved as draft successfully!");
      }

      // 3. Return to recruiter dashboard after a short pause
      setTimeout(() => {
        navigate("/recruiter/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Job creation error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create the job offer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        to="/recruiter/dashboard"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-gray-900">
        Create Job Offer
      </h1>

      <p className="mt-2 text-gray-600">
        Add the details of your recruitment offer.
      </p>

      <form
        onSubmit={(e) => handleSubmit(e, true)}
        className="mt-8 space-y-5 rounded-xl border bg-white p-6"
      >
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium">
            Job title *
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            type="text"
            required
            placeholder="Full Stack Developer"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Job description *
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
            placeholder="Describe the job, responsibilities and requirements..."
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Required skills
          </label>

          <input
            name="requiredSkills"
            value={form.requiredSkills}
            onChange={handleChange}
            type="text"
            placeholder="React, Node.js, MongoDB"
            className="w-full rounded-lg border px-4 py-3"
          />

          <p className="mt-1 text-sm text-gray-500">
            Separate skills with commas.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Keywords
          </label>

          <input
            name="keywords"
            value={form.keywords}
            onChange={handleChange}
            type="text"
            placeholder="Full Stack, REST API"
            className="w-full rounded-lg border px-4 py-3"
          />

          <p className="mt-1 text-sm text-gray-500">
            Separate keywords with commas.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-lg border px-5 py-3 text-gray-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}