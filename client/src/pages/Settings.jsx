import {
  UserRound,
  Mail,
  ShieldCheck,
  BrainCircuit,
  Info,
  ChevronRight,
  Settings as SettingsIcon,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Settings() {
  const { user } = useAuth();

  const displayName = user?.name || "User";
  const email = user?.email || "No email available";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <SettingsIcon size={16} />
            <span>Workspace</span>
            <ChevronRight size={14} />
            <span className="text-slate-700">Settings</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your account and view application information.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account profile */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Account profile
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Your personal account information
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                  {initial}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-slate-900">
                    {displayName}
                  </h3>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {email}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <ShieldCheck size={13} />
                    Authenticated account
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account information */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-slate-800">
                Account information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Information associated with your DocuMind account
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <UserRound size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Full name</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {displayName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Mail size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Email address</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <ShieldCheck size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Account status</p>
                  <p className="mt-1 text-sm font-medium text-emerald-700">
                    Active
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Application information */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <BrainCircuit size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Application information
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    About your document assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Application name
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your AI-powered document workspace
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  DocuMind
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-medium text-slate-800">Version</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Current application version
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  1.0.0
                </span>
              </div>
            </div>
          </section>

          {/* Information note */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />

            <div>
              <p className="text-sm font-medium text-blue-900">
                Account management
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-800/80">
                Profile editing, password changes, and account management
                features can be added in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
