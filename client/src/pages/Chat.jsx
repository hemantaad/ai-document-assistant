import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Plus,
  Send,
  MessageSquare,
  Trash2,
  LoaderCircle,
  FileText,
  AlertCircle,
  Sparkles,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Clock3,
} from "lucide-react";

import {
  sendChatMessage,
  getConversations,
  getConversation,
  deleteConversation,
} from "../services/chatService";

import { getDocuments } from "../services/documentService";

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function Chat() {
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");

  // Mobile drawer and desktop collapse are independent.
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  // Fetch conversations
  const {
    data: conversationData,
    isLoading: conversationsLoading,
    isError: conversationsError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const conversations = conversationData?.conversations || [];

  // Fetch documents
  const { data: documentData, isLoading: documentsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  const documents = documentData?.documents || [];

  const readyDocuments = documents.filter(
    (document) => document.status === "ready",
  );

  // Fetch active conversation
  const {
    data: activeConversation,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery({
    queryKey: ["conversation", activeConversationId],
    queryFn: () => getConversation(activeConversationId),
    enabled: Boolean(activeConversationId),
  });

  const messages = activeConversation?.messages || [];

  const activeDocumentId =
    activeConversation?.conversation?.documentId?.toString() || "";

  const currentDocumentId = activeConversationId
    ? activeDocumentId
    : selectedDocumentId;

  const currentDocument = documents.find(
    (document) =>
      (document._id || document.id)?.toString() === currentDocumentId,
  );

  // Send message
  const chatMutation = useMutation({
    mutationFn: sendChatMessage,

    onSuccess: (result) => {
      setQuestion("");
      setError("");

      setActiveConversationId(result.conversationId);

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversation", result.conversationId],
      });
    },

    onError: (err) => {
      setError(
        err.response?.data?.message ||
          "Unable to send your question. Please try again.",
      );
    },
  });

  // Delete conversation
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,

    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      queryClient.removeQueries({
        queryKey: ["conversation", deletedId],
      });

      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
        setSelectedDocumentId("");
        setQuestion("");
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || chatMutation.isPending) return;

    setError("");

    chatMutation.mutate({
      question: trimmedQuestion,

      ...(activeConversationId
        ? { conversationId: activeConversationId }
        : selectedDocumentId
          ? { documentId: selectedDocumentId }
          : {}),
    });
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setSelectedDocumentId("");
    setQuestion("");
    setError("");
    setIsHistoryOpen(false);
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setError("");
    setQuestion("");
    setIsHistoryOpen(false);
  };

  const handleDeleteConversation = (event, id) => {
    event.stopPropagation();

    if (window.confirm("Delete this conversation and all its messages?")) {
      deleteMutation.mutate(id);
    }
  };

  const getConversationDocumentName = (conversation) => {
    if (!conversation.documentId) return "All documents";

    const document = documents.find(
      (doc) =>
        (doc._id || doc.id)?.toString() === conversation.documentId.toString(),
    );

    return document?.originalName || "Specific document";
  };

  const isNewChat = !activeConversationId;

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] min-h-0 overflow-hidden bg-white lg:h-dvh">
      {/* Mobile drawer backdrop */}
      {isHistoryOpen && (
        <button
          type="button"
          aria-label="Close conversation history"
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Conversation history sidebar */}
      <aside
        className={`
          fixed bottom-0 left-0 top-16 z-40 flex w-80 max-w-[85vw]
          flex-col border-r border-slate-200 bg-slate-50
          transition-transform duration-300
          lg:static lg:z-auto lg:h-full lg:w-72 lg:max-w-none
          lg:translate-x-0 lg:transition-all lg:duration-300
          ${isHistoryOpen ? "translate-x-0" : "-translate-x-full"}
          ${isHistoryCollapsed ? "lg:hidden" : ""}
        `}
      >
        {/* Sidebar heading */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h2 className="font-semibold text-slate-800">Conversations</h2>
            <p className="mt-1 text-xs text-slate-500">Your chat history</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              title="New conversation"
              aria-label="New conversation"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <Plus size={19} />
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              aria-label="Close history"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 lg:hidden"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {conversationsLoading ? (
            <div className="flex justify-center py-10">
              <LoaderCircle className="animate-spin text-blue-600" size={22} />
            </div>
          ) : conversationsError ? (
            <div className="px-3 py-8 text-center">
              <AlertCircle className="mx-auto mb-2 text-red-500" size={20} />
              <p className="text-sm text-slate-500">
                Unable to load conversations.
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <MessageSquare
                className="mx-auto mb-3 text-slate-300"
                size={27}
              />
              <p className="text-sm font-medium text-slate-600">
                No conversations yet
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Your conversations will appear here.
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive = activeConversationId === conversation._id;

              return (
                <div
                  key={conversation._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectConversation(conversation._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectConversation(conversation._id);
                    }
                  }}
                  className={`
                    group flex cursor-pointer items-start gap-3 rounded-xl
                    border p-3 transition
                    ${
                      isActive
                        ? "border-blue-200 bg-blue-50"
                        : "border-transparent hover:border-slate-200 hover:bg-white"
                    }
                  `}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    <MessageSquare size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        isActive ? "text-blue-800" : "text-slate-700"
                      }`}
                    >
                      {conversation.title || "Untitled conversation"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {getConversationDocumentName(conversation)}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock3 size={12} />
                      {formatDate(conversation.updatedAt)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleDeleteConversation(event, conversation._id)
                    }
                    disabled={deleteMutation.isPending}
                    aria-label="Delete conversation"
                    title="Delete conversation"
                    className="rounded-lg p-1.5 text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-white p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText size={16} />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-700">
                Document Assistant
              </p>
              <p className="text-xs text-slate-400">AI-powered document chat</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main chat workspace */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Chat header */}
        <header className="flex h-20 min-h-20 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile history drawer */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="Open conversation history"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* Desktop history collapse toggle */}
            <button
              type="button"
              onClick={() => setIsHistoryCollapsed((previous) => !previous)}
              aria-label={
                isHistoryCollapsed
                  ? "Show conversation history"
                  : "Hide conversation history"
              }
              title={
                isHistoryCollapsed
                  ? "Show conversation history"
                  : "Hide conversation history"
              }
              className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:block"
            >
              {isHistoryCollapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bot size={22} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                AI Document Assistant
              </h1>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {activeConversationId
                  ? currentDocument
                    ? currentDocument.originalName
                    : activeDocumentId
                      ? "Specific document"
                      : "All documents"
                  : currentDocument
                    ? `New chat · ${currentDocument.originalName}`
                    : "Start a conversation with your documents"}
              </p>
            </div>
          </div>

          {/* Document selector */}
          <div className="flex max-w-full items-center gap-2">
            <FileText
              size={16}
              className="hidden shrink-0 text-slate-400 sm:block"
            />

            <select
              aria-label="Choose document"
              value={currentDocumentId}
              disabled={Boolean(activeConversationId) || documentsLoading}
              onChange={(event) => setSelectedDocumentId(event.target.value)}
              className="max-w-[170px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 sm:max-w-56 sm:text-sm"
            >
              <option value="">All documents</option>

              {readyDocuments.map((document) => (
                <option
                  key={document._id || document.id}
                  value={document._id || document.id}
                >
                  {document.originalName}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Message area */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-4 py-6 sm:px-8 sm:py-8">
          {isNewChat ? (
            <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Sparkles size={31} />
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
                What would you like to know?
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Ask questions about your uploaded documents. Your assistant will
                search their content and generate answers with source
                references.
              </p>

              {documents.length === 0 ? (
                <div className="mt-7 max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                    <FileText size={17} />
                    No documents uploaded
                  </div>
                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Upload a document before asking questions about its
                    contents.
                  </p>
                </div>
              ) : readyDocuments.length === 0 ? (
                <div className="mt-7 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Your documents are not ready yet. Try again once processing is
                  complete.
                </div>
              ) : (
                <div className="mt-8 w-full max-w-xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Try asking
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Summarize my documents",
                      "What are the key topics?",
                      "Find important information",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuestion(suggestion)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : messagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <LoaderCircle
                  className="mx-auto animate-spin text-blue-600"
                  size={29}
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : messagesError ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <AlertCircle className="mb-3 text-red-500" size={30} />
              <p className="font-medium text-slate-700">
                Unable to load this conversation
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Please try selecting it again.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Send a message to start this conversation.
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message._id}
                    className={`flex gap-3 sm:gap-4 ${
                      isUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isUser
                          ? "bg-slate-200 text-slate-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {isUser ? (
                        <span className="text-xs font-semibold">You</span>
                      ) : (
                        <Bot size={19} />
                      )}
                    </div>

                    <div
                      className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-3.5 sm:max-w-[85%] ${
                        isUser
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : "rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-7">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <div className="prose prose-sm max-w-none break-words prose-headings:font-semibold prose-headings:text-slate-800 prose-p:leading-7 prose-a:text-blue-600 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-slate-700 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-100">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>

                          {message.sources?.length > 0 && (
                            <div className="mt-5 border-t border-slate-100 pt-4">
                              <div className="mb-3 flex items-center gap-2">
                                <FileText size={14} className="text-blue-600" />
                                <p className="text-xs font-semibold text-slate-600">
                                  Sources ({message.sources.length})
                                </p>
                              </div>

                              <div className="space-y-2">
                                {message.sources.map((source, index) => (
                                  <div
                                    key={
                                      source._id || `${source.chunkId}-${index}`
                                    }
                                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600"
                                  >
                                    <FileText
                                      size={14}
                                      className="shrink-0 text-blue-500"
                                    />

                                    <span className="min-w-0 truncate">
                                      Document reference:{" "}
                                      {String(source.documentId).slice(-8)}
                                      {source.pageNumber !== undefined &&
                                        ` · Page ${source.pageNumber}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {chatMutation.isPending && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Bot size={19} />
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <LoaderCircle
                      size={16}
                      className="animate-spin text-blue-600"
                    />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="shrink-0 px-4 pt-3 sm:px-8">
            <div className="mx-auto flex max-w-3xl items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Message composer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-4 pt-4 sm:px-8 sm:pb-5">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50"
          >
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask anything about your documents..."
              rows={2}
              disabled={chatMutation.isPending}
              className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!question.trim() || chatMutation.isPending}
              title="Send message"
              aria-label="Send message"
              className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {chatMutation.isPending ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
            Press Enter to send · Shift + Enter for a new line
          </p>

          <p className="mt-1 text-center text-[11px] text-slate-400">
            AI responses may contain inaccuracies. Verify important information
            against your documents.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Chat;
