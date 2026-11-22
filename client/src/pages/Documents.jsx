import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  FileText,
  Trash2,
  LoaderCircle,
  AlertCircle,
  Files,
  RefreshCw,
  Upload,
  HardDrive,
  CheckCircle2,
  Clock3,
  XCircle,
  FileUp,
  X,
} from "lucide-react";

import UploadZone from "../components/documents/UploadZone";
import { getDocuments, deleteDocument } from "../services/documentService";

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFileExtension(document) {
  const name = document.originalName || "";
  const extension = name.split(".").pop();

  return extension && extension !== name ? extension.toUpperCase() : "FILE";
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "unknown";

  const styles = {
    ready: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
    uploaded: "bg-amber-50 text-amber-700 ring-amber-600/20",
    failed: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        styles[normalizedStatus] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {normalizedStatus}
    </span>
  );
}

function SummaryCard({ label, value, description, icon: Icon, iconStyles }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className={`rounded-xl p-3 ${iconStyles}`}>
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Documents() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setError("");
    },
    onError: (err) => {
      setError(
        err.response?.data?.message || "Unable to delete this document.",
      );
    },
  });

  const documents = data?.documents || [];

  const totalStorage = documents.reduce(
    (total, document) => total + (document.fileSize || 0),
    0,
  );

  const readyCount = documents.filter(
    (document) => document.status === "ready",
  ).length;

  const processingCount = documents.filter((document) =>
    ["processing", "uploaded"].includes(document.status),
  ).length;

  const failedCount = documents.filter(
    (document) => document.status === "failed",
  ).length;

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = document.originalName
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "processing"
          ? ["processing", "uploaded"].includes(document.status)
          : document.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  const handleDelete = (document) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.originalName}"?`,
    );

    if (!confirmed) return;

    setError("");
    deleteMutation.mutate(document._id || document.id);
  };

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const filters = [
    { label: "All files", value: "all", count: documents.length },
    { label: "Ready", value: "ready", count: readyCount },
    { label: "Processing", value: "processing", count: processingCount },
    { label: "Failed", value: "failed", count: failedCount },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Files size={17} />
            Your workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Documents
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Upload, organize, and manage your documents in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            document.getElementById("document-upload")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <Upload size={17} />
          Upload Document
        </button>
      </div>

      {/* Summary cards */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Documents"
          value={isLoading ? "—" : documents.length}
          description="Files in your workspace"
          icon={Files}
          iconStyles="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          label="Ready Documents"
          value={isLoading ? "—" : readyCount}
          description="Available for AI chat"
          icon={CheckCircle2}
          iconStyles="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Processing"
          value={isLoading ? "—" : processingCount}
          description="Being processed or uploaded"
          icon={Clock3}
          iconStyles="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          label="Storage Used"
          value={isLoading ? "—" : formatFileSize(totalStorage)}
          description="Combined file size"
          icon={HardDrive}
          iconStyles="bg-violet-50 text-violet-600"
        />
      </section>

      {/* Upload section */}
      <section id="document-upload" className="mb-10 scroll-mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Upload Documents
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add files to your workspace and start asking questions with AI.
          </p>
        </div>

        <UploadZone onUploadSuccess={handleUploadSuccess} />
      </section>

      {/* Document list */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Your Documents
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {documents.length}{" "}
              {documents.length === 1 ? "document" : "documents"} uploaded
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh documents"
            aria-label="Refresh documents"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by document name..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  statusFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    statusFilter === filter.value
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Delete error */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle size={26} className="animate-spin text-blue-600" />
              Loading your documents...
            </div>
          </div>
        ) : isError ? (
          /* Load error */
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={30} />

            <h3 className="font-semibold text-red-800">
              Unable to load documents
            </h3>

            <p className="mt-2 text-sm text-red-600">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              {searchTerm || statusFilter !== "all" ? (
                <Search size={30} />
              ) : (
                <FileUp size={30} />
              )}
            </div>

            <h3 className="font-semibold text-slate-800">
              {searchTerm || statusFilter !== "all"
                ? "No matching documents"
                : "Your workspace is empty"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {searchTerm || statusFilter !== "all"
                ? "Try changing your search term or selecting a different status filter."
                : "Upload your first PDF, DOCX, or TXT file to start building your document library."}
            </p>

            {searchTerm || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  document.getElementById("document-upload")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Upload size={17} />
                Upload a document
              </button>
            )}
          </div>
        ) : (
          /* Document table */
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Document</th>
                    <th className="px-5 py-4 font-semibold">Type</th>
                    <th className="px-5 py-4 font-semibold">Size</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Uploaded</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((document) => (
                    <tr
                      key={document._id || document.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex max-w-sm items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={20} />
                          </div>

                          <div className="min-w-0">
                            <p
                              title={document.originalName}
                              className="truncate font-semibold text-slate-800"
                            >
                              {document.originalName}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Uploaded document
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-500">
                        {getFileExtension(document)}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {formatFileSize(document.fileSize)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={document.status} />
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(document.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(document)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Delete document"
                          aria-label={`Delete ${document.originalName}`}
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables ===
                            (document._id || document.id) ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing {filteredDocuments.length} of {documents.length}{" "}
                documents
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Documents;
