import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import * as resumeService from "../services/resumeService";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function validateFile(file) {
  if (file.type !== "application/pdf") {
    return "Only PDF files are accepted.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}

export default function UploadResume() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | success

  const pickFile = (selected) => {
    if (!selected) return;
    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
    setStatus("idle");
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await resumeService.uploadResume(file, (evt) => {
        if (evt.total) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      });

      localStorage.setItem("latestResumeId", res.data._id);
      setStatus("success");
      // Laisse le temps de voir la confirmation avant de continuer vers l'offre d'emploi
      setTimeout(() => navigate("/analyze"), 900);
      return res.data;
    } catch (err) {
      setStatus("idle");
      setError(
        err.response?.data?.message ||
          "Upload failed. Please check your connection and try again."
      );
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Upload your resume</h1>
      <p className="mt-1 text-sm text-slate-500">
        PDF only, up to {MAX_FILE_SIZE_MB}MB. We'll extract your skills and experience
        automatically.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isDragging
            ? "border-slate-900 bg-slate-100"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <FiUploadCloud className="h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm text-slate-600">
          Drag and drop your resume here, or click to browse
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && !error && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <FiFile className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          {status !== "uploading" && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setStatus("idle");
              }}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Remove file"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {status === "uploading" && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">Uploading… {progress}%</p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          <span>Resume uploaded. Taking you to the next step…</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
        className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === "uploading" ? "Uploading…" : "Upload resume"}
      </button>
    </div>
  );
}
