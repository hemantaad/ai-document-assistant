import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  FileUp,
} from "lucide-react";

import { uploadDocument } from "../../services/documentService";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadZone({ onUploadSuccess }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const validateFile = (file) => {
    setError("");
    setSuccessMessage("");

    const extension = `.${file.name.split(".").pop().toLowerCase()}`;

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);
      setError(
        "Unsupported file format. Please select a PDF, DOCX, or TXT file.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("File size must not exceed 4 MB.");
      return;
    }

    setProgress(0);
    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setError("");
    setSuccessMessage("");
    setProgress(0);
    setIsUploading(true);

    try {
      const result = await uploadDocument(selectedFile, setProgress);

      setSuccessMessage(result.message || "Document uploaded successfully.");

      setSelectedFile(null);
      setProgress(100);

      onUploadSuccess?.(result);
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        setError("Please log in before uploading documents.");
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to upload document. Please try again.",
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    if (isUploading) return;

    setSelectedFile(null);
    setProgress(0);
    setError("");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      {/* Drop zone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isUploading) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-10 text-center transition-all duration-200 sm:py-12 ${
          isDragging
            ? "scale-[1.005] border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/40"
        } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition ${
            isDragging ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
          }`}
        >
          <FileUp size={30} />
        </div>

        <h3 className="text-base font-semibold text-slate-800">
          {isDragging
            ? "Drop your document here"
            : "Drag and drop your document"}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Or select a file from your computer.
        </p>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={17} />
          Browse Files
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            PDF
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            DOCX
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            TXT
          </span>
          <span className="text-xs text-slate-400">
            Maximum file size: 4 MB
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Selected file */}
      {selectedFile && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <p
                title={selectedFile.name}
                className="truncate text-sm font-semibold text-slate-800"
              >
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={removeSelectedFile}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label="Remove selected file"
              title="Remove file"
            >
              <X size={19} />
            </button>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-slate-600">
                  {progress >= 100
                    ? "Finishing document processing..."
                    : "Uploading your document..."}
                </span>

                <span className="font-semibold tabular-nums text-blue-600">
                  {progress}%
                </span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload action */}
          <button
            type="button"
            disabled={isUploading}
            onClick={handleUpload}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Document
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadZone;
