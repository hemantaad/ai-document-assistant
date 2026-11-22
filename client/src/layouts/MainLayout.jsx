import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, BrainCircuit } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((previous) => !previous);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Main application sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main content */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BrainCircuit size={19} />
            </div>

            <span className="font-bold tracking-tight text-slate-900">
              DocuMind
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
