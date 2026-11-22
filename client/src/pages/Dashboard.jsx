import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  MessageSquare,
  HardDrive,
  ArrowUpRight,
  Upload,
  Plus,
  Clock3,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  Files,
  CheckCircle2,
  FileUp,
} from "lucide-react";

import { getDocuments } from "../services/documentService";
import { getConversations } from "../services/chatService";
import { useAuth } from "../context/AuthContext";

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(date) {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFileExtension(document) {
  const name = document.originalName || "";
  const extension = name.split(".").pop();

  return extension && extension !== name
    ? extension.toUpperCase()
    : (document.fileType || "FILE").toUpperCase();
}

function getStatusStyles(status) {
  switch (status) {
    case "ready":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "failed":
      return "bg-red-50 text-red-700 ring-red-600/20";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}

function StatCard({ label, value, description, icon: Icon, iconStyles }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className={`rounded-xl p-3 ${iconStyles}`}>
          <Icon size={20} />
        </div>
      </div>

      <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </h2>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    data: documentData,
    isLoading: documentsLoading,
    isError: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
    enabled: isAuthenticated,
    refetchOnMount: "always",
  });

  const {
    data: conversationData,
    isLoading: conversationsLoading,
    isError: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: isAuthenticated,
    refetchOnMount: "always",
  });

  const documents = documentData?.documents || [];
  const conversations = conversationData?.conversations || [];

  const totalStorage = documents.reduce(
    (total, document) => total + (document.fileSize || 0),
    0,
  );

  const readyDocuments = documents.filter(
    (document) => document.status === "ready",
  ).length;

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const recentConversations = [...conversations]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0),
    )
    .slice(0, 4);

  const handleProtectedNavigation = (path) => {
    navigate(isAuthenticated ? path : "/login");
  };

  const stats = [
    {
      label: "Total Documents",
      value: isAuthenticated
        ? documentsLoading
          ? "—"
          : documents.length
        : "—",
      description: isAuthenticated
        ? "Files in your workspace"
        : "Sign in to view your documents",
      icon: Files,
      iconStyles: "bg-blue-50 text-blue-600",
    },
    {
      label: "Conversations",
      value: isAuthenticated
        ? conversationsLoading
          ? "—"
          : conversations.length
        : "—",
      description: isAuthenticated
        ? "AI conversations started"
        : "Sign in to view your conversations",
      icon: MessageSquare,
      iconStyles: "bg-violet-50 text-violet-600",
    },
    {
      label: "Storage Used",
      value: isAuthenticated
        ? documentsLoading
          ? "—"
          : formatFileSize(totalStorage)
        : "—",
      description: isAuthenticated
        ? "Total uploaded file size"
        : "Sign in to view storage usage",
      icon: HardDrive,
      iconStyles: "bg-amber-50 text-amber-600",
    },
  ];

  const isLoading =
    isAuthenticated && (documentsLoading || conversationsLoading);

  const hasError = isAuthenticated && (documentsError || conversationsError);

  const handleRetry = () => {
    refetchDocuments();
    refetchConversations();
  };

  const firstName = user?.name?.trim()?.split(/\s+/)[0];

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Welcome section */}
      <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-8 text-white shadow-lg shadow-blue-900/10 sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              <Sparkles size={14} />
              Your AI-powered workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isAuthenticated
                ? `Welcome back, ${firstName || "there"}!`
                : "Welcome to DocuMind"}
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
              {isAuthenticated
                ? "Your documents, knowledge, and conversations are all in one place. What would you like to explore today?"
                : "Explore DocuMind, an AI-powered assistant that helps you organize documents, find information, and get answers from your files."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/documents")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-[0.98]"
              >
                <Upload size={17} />
                Upload a document
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/chat")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                <MessageSquare size={17} />
                Start a conversation
              </button>
            </div>

            {!isAuthenticated && (
              <p className="mt-4 text-xs text-blue-100">
                Explore the dashboard freely. Sign in or create an account to
                access your personal workspace.
              </p>
            )}
          </div>

          <div className="hidden shrink-0 items-center justify-center sm:flex">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 shadow-inner">
                <Sparkles size={48} strokeWidth={1.4} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error state for authenticated users only */}
      {hasError && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={18} />
            Unable to load some dashboard information.
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Workspace Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isAuthenticated
              ? "A quick look at your activity and documents."
              : "Sign in to see your personal workspace statistics."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* Main dashboard content */}
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-3">
        {/* Recent documents */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Documents</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isAuthenticated
                  ? "Your latest uploaded files"
                  : "Your uploaded files will appear here"}
              </p>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate("/documents")}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>

          {isAuthenticated && documentsLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-3"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : isAuthenticated && recentDocuments.length > 0 ? (
            <div className="divide-y divide-slate-100 px-5 sm:px-6">
              {recentDocuments.map((document) => (
                <div
                  key={document._id || document.id}
                  className="flex min-w-0 items-center gap-3 py-4 transition hover:bg-slate-50/70 sm:gap-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      title={document.originalName}
                      className="truncate text-sm font-semibold text-slate-800"
                    >
                      {document.originalName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {getFileExtension(document)} ·{" "}
                      {formatFileSize(document.fileSize)} ·{" "}
                      {formatDate(document.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${getStatusStyles(document.status)}`}
                  >
                    {document.status || "processing"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <FileUp size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                {isAuthenticated
                  ? "No documents yet"
                  : "Your documents, organized"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {isAuthenticated
                  ? "Upload your first PDF, DOCX, or TXT file and start exploring your documents with AI."
                  : "Upload PDF, DOCX, or TXT files and let DocuMind help you find information across them."}
              </p>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/documents")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                {isAuthenticated ? "Upload your first document" : "Get started"}
              </button>
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Quick actions */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump straight into your workspace.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/documents")}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition group-hover:bg-blue-100">
                  <Upload size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Upload a document
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF, DOCX or TXT
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/chat")}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-violet-200 hover:bg-violet-50/60"
              >
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 transition group-hover:bg-violet-100">
                  <Sparkles size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">Ask AI</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Chat with your documents
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                />
              </button>
            </div>
          </section>

          {/* Workspace activity */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
              <h2 className="font-semibold text-slate-900">
                Workspace Activity
              </h2>
            </div>

            {isAuthenticated ? (
              documentsLoading || conversationsLoading ? (
                <div className="mt-5 flex items-center justify-center py-5">
                  <LoaderCircle
                    size={22}
                    className="animate-spin text-blue-600"
                  />
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Processed documents
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {readyDocuments} / {documents.length}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          documents.length
                            ? (readyDocuments / documents.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-500">
                      Total conversations
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {conversations.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Documents ready for AI
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {readyDocuments}
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">
                  Your workspace, powered by AI
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to track document processing, storage, and your
                  conversation activity.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Recent conversations */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Conversations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAuthenticated
                ? "Pick up where you left off."
                : "Your AI conversations will appear here."}
            </p>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Open AI Chat
              <ArrowUpRight size={16} />
            </button>
          )}
        </div>

        {isAuthenticated && conversationsLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoaderCircle size={24} className="animate-spin text-blue-600" />
          </div>
        ) : isAuthenticated && recentConversations.length > 0 ? (
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            {recentConversations.map((conversation) => (
              <button
                key={conversation._id || conversation.id}
                type="button"
                onClick={() => navigate("/chat")}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <MessageSquare size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {conversation.title || "New conversation"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(
                      conversation.updatedAt || conversation.createdAt,
                    )}
                  </p>
                </div>

                <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 rounded-xl bg-violet-50 p-3 text-violet-500">
              <MessageSquare size={24} />
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              {isAuthenticated
                ? "No conversations yet"
                : "Ready to ask your documents?"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {isAuthenticated
                ? "Start a conversation with AI to see it here."
                : "Sign in to start asking questions and get answers from your uploaded files."}
            </p>

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/chat")}
              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {isAuthenticated ? "Start chatting" : "Get started"}
            </button>
          </div>
        )}
      </section>

      {isLoading && (
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock3 size={13} />
          Loading your workspace...
        </p>
      )}
    </div>
  );
}

export default Dashboard;
