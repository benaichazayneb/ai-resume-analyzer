
import { useCallback, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import * as resumeService from "../services/resumeService";
import * as applicationService from "../services/applicationService";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES =
  MAX_FILE_SIZE_MB * 1024 * 1024;

function validateFile(file) {
  if (!file) {
    return "Please select a file.";
  }

  const isPdfExtension = file.name
    .toLowerCase()
    .endsWith(".pdf");

  const isPdfMime =
    !file.type || file.type === "application/pdf";

  if (!isPdfExtension || !isPdfMime) {
    return "Only PDF files are accepted.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null;
}

export default function UploadResume() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Si l'upload vient d'une offre, on récupère son ID.
  const jobId = searchParams.get("jobId");

  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");

  const pickFile = (selected) => {
    if (!selected) return;

    const validationError = validateFile(selected);

    if (validationError) {
      setError(validationError);
      setFile(null);
      setStatus("idle");
      setProgress(0);
      return;
    }

    setError("");
    setFile(selected);
    setStatus("idle");
    setProgress(0);
  };

  const onDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    pickFile(droppedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setError("");

    try {
      // 1. Upload du CV
      const response = await resumeService.uploadResume(
        file,
        (event) => {
          if (event.total) {
            const percentage = Math.round(
              (event.loaded / event.total) * 100
            );

            setProgress(percentage);
          }
        }
      );

      console.log("Resume upload response:", response);

      if (!response?.success || !response?.data?.id) {
        throw new Error(
          "Invalid response from the server."
        );
      }

      const resumeId = response.data.id;

      // 2. Enregistrer l'identifiant du CV
      localStorage.setItem(
        "latestResumeId",
        resumeId
      );

      setProgress(100);

      // 3. Si l'upload vient d'une offre, postuler
      if (jobId) {
        setStatus("applying");

        await applicationService.createApplication(
          jobId,
          resumeId
        );

        setStatus("success");

        // Après la candidature, ouvrir la liste des candidatures.
        setTimeout(() => {
          navigate("/applications", {
            replace: true,
          });
        }, 1200);

        return;
      }

      // 4. Upload indépendant d'une candidature
      setStatus("success");

      setTimeout(() => {
        navigate("/candidate/dashboard", {
          replace: true,
        });
      }, 1200);

    } catch (err) {
      console.error("Upload/application error:", err);

      setStatus("idle");
      setProgress(0);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Upload failed. Please try again."
      );
    }
  };

  const handleRemoveFile = (event) => {
    event.stopPropagation();

    setFile(null);
    setError("");
    setProgress(0);
    setStatus("idle");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isBusy =
    status === "uploading" ||
    status === "applying";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link
        to={jobId ? `/jobs/${jobId}` : "/candidate/dashboard"}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-slate-900">
        Upload your resume
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        PDF only, up to {MAX_FILE_SIZE_MB}MB.
        We'll extract your skills and experience automatically.
      </p>

      {jobId && (
        <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          After uploading your CV, your application
          will be submitted automatically.
        </div>
      )}

      {/* Zone de dépôt */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => {
          if (!isBusy) {
            inputRef.current?.click();
          }
        }}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isDragging
            ? "border-slate-900 bg-slate-100"
            : "border-slate-300 bg-white hover:border-slate-400"
        } ${
          isBusy
            ? "cursor-not-allowed opacity-70"
            : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={isBusy}
          onChange={(event) => {
            pickFile(event.target.files?.[0]);
          }}
        />

        <FiUploadCloud className="h-8 w-8 text-slate-400" />

        <p className="mt-3 text-sm text-slate-600">
          Drag and drop your resume here, or click to browse
        </p>

        <p className="mt-1 text-xs text-slate-400">
          PDF — Maximum {MAX_FILE_SIZE_MB}MB
        </p>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fichier sélectionné */}
      {file && !error && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FiFile className="h-5 w-5 shrink-0 text-slate-400" />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {file.name}
              </p>

              <p className="text-xs text-slate-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          {!isBusy && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="ml-3 text-slate-400 hover:text-slate-600"
              aria-label="Remove file"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Progression */}
      {(status === "uploading" ||
        status === "applying") && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {status === "uploading"
              ? `Uploading… ${progress}%`
              : "Submitting your application…"}
          </p>
        </div>
      )}

      {/* Succès */}
      {status === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          <FiCheckCircle className="h-4 w-4 shrink-0" />

          <span>
            {jobId
              ? "CV uploaded and application submitted successfully!"
              : "Resume uploaded successfully!"}
          </span>
        </div>
      )}

      {/* Bouton */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isBusy || status === "success"}
        className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === "uploading"
          ? "Uploading…"
          : status === "applying"
          ? "Submitting application…"
          : status === "success"
          ? "Completed"
          : jobId
          ? "Upload CV and Apply"
          : "Upload resume"}
      </button>
    </div>
  );
}