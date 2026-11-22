import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Files,
  MessageSquare,
  Settings,
  Plus,
  BrainCircuit,
  LogOut,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LogIn,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, public: true },
  { name: "Documents", path: "/documents", icon: Files },
  { name: "AI Chat", path: "/chat", icon: MessageSquare },
];

function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/", { replace: true });
  };

  const handleBrandClick = () => {
    if (isCollapsed) {
      onToggleCollapse();
      return;
    }

    navigate("/");
    onClose();
  };

  const handleProtectedNavigation = (path) => {
    onClose();
    navigate(isAuthenticated ? path : "/login");
  };

  const handleSidebarClick = (event) => {
    if (!isCollapsed) return;

    const clickedControl = event.target.closest(
      "button, a, input, select, textarea",
    );

    if (!clickedControl) {
      onToggleCollapse();
    }
  };

  const navLinkClass = ({ isActive }) =>
    `group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
      isCollapsed ? "gap-3 px-3 lg:justify-center lg:px-0" : "gap-3 px-3"
    } ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside
      id="app-sidebar"
      onClick={handleSidebarClick}
      className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0
        flex-col border-r border-slate-200 bg-white px-4 py-5
        transition-all duration-300 ease-in-out
        lg:sticky lg:top-0 lg:translate-x-0
        ${isCollapsed ? "lg:w-20 lg:cursor-pointer" : "lg:w-72"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Brand */}
      <div className={`mb-5 ${isCollapsed ? "lg:flex lg:justify-center" : ""}`}>
        <div
          className={`flex min-h-11 items-center ${
            isCollapsed
              ? "justify-between lg:justify-center"
              : "justify-between"
          }`}
        >
          <button
            type="button"
            onClick={handleBrandClick}
            title={isCollapsed ? "Expand sidebar" : "Go to Dashboard"}
            aria-label={
              isCollapsed ? "Expand sidebar" : "DocuMind home - Go to Dashboard"
            }
            className={`
              group flex min-w-0 items-center gap-3 rounded-xl text-left
              outline-none transition hover:opacity-90
              focus-visible:ring-2 focus-visible:ring-blue-500
              focus-visible:ring-offset-2
              ${isCollapsed ? "lg:justify-center" : ""}
            `}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <BrainCircuit
                size={24}
                className={`absolute transition-all duration-200 ${
                  isCollapsed
                    ? "lg:scale-100 lg:opacity-100 lg:group-hover:scale-75 lg:group-hover:opacity-0"
                    : ""
                }`}
              />

              {isCollapsed && (
                <PanelLeftOpen
                  size={23}
                  strokeWidth={2}
                  className="absolute scale-75 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
                />
              )}
            </div>

            <div className={isCollapsed ? "lg:hidden" : ""}>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                DocuMind
              </h1>
              <p className="text-xs text-slate-500">AI Document Assistant</p>
            </div>
          </button>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 lg:flex"
            >
              <PanelLeftClose size={22} strokeWidth={1.9} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={() => handleProtectedNavigation("/documents")}
        title={isCollapsed ? "Upload Document" : undefined}
        className={`
          mb-8 flex w-full items-center rounded-xl bg-blue-600
          py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200
          transition hover:bg-blue-700 active:scale-[0.98]
          ${
            isCollapsed
              ? "justify-center gap-2 px-4 lg:gap-0 lg:px-0"
              : "justify-center gap-2 px-4"
          }
        `}
      >
        <Plus size={19} />
        <span className={isCollapsed ? "lg:hidden" : ""}>Upload Document</span>
      </button>

      {/* Navigation heading */}
      <div
        className={`mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 ${
          isCollapsed ? "lg:hidden" : ""
        }`}
      >
        Workspace
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navigation.map(({ name, path, icon: Icon, public: isPublic }) => {
          if (!isPublic) {
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleProtectedNavigation(path)}
                title={isCollapsed ? name : undefined}
                className={`
                  group flex w-full items-center rounded-xl py-3 text-left
                  text-sm font-medium text-slate-600 transition
                  hover:bg-slate-100 hover:text-slate-900
                  ${
                    isCollapsed
                      ? "gap-3 px-3 lg:justify-center lg:px-0"
                      : "gap-3 px-3"
                  }
                `}
              >
                <Icon size={19} className="shrink-0" />
                <span className={isCollapsed ? "lg:hidden" : ""}>{name}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={name}
              to={path}
              end
              onClick={onClose}
              title={isCollapsed ? name : undefined}
              className={navLinkClass}
            >
              <Icon size={19} className="shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : ""}>{name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-slate-100 pt-4">
        {isAuthenticated ? (
          <>
            <NavLink
              to="/settings"
              onClick={onClose}
              title={isCollapsed ? "Settings" : undefined}
              className={navLinkClass}
            >
              <Settings size={19} className="shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : ""}>Settings</span>
            </NavLink>

            {/* Authenticated user profile */}
            <div
              className={`mt-5 flex items-center rounded-xl border border-slate-100 bg-slate-50 ${
                isCollapsed ? "gap-3 p-3 lg:justify-center lg:p-2" : "gap-3 p-3"
              }`}
            >
              <div
                title={isCollapsed ? user?.name || "User" : undefined}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div
                className={`min-w-0 flex-1 ${isCollapsed ? "lg:hidden" : ""}`}
              >
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className={`rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className={`mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              Your Account
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              title={isCollapsed ? "Login" : undefined}
              className={`
                flex w-full items-center rounded-xl py-3 text-sm font-medium
                text-slate-600 transition hover:bg-slate-100 hover:text-slate-900
                ${
                  isCollapsed
                    ? "gap-3 px-3 lg:justify-center lg:px-0"
                    : "gap-3 px-3"
                }
              `}
            >
              <LogIn size={19} className="shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : ""}>Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/register");
              }}
              title={isCollapsed ? "Sign Up" : undefined}
              className={`
                mt-1 flex w-full items-center rounded-xl py-3 text-sm
                font-medium text-slate-600 transition
                hover:bg-slate-100 hover:text-slate-900
                ${
                  isCollapsed
                    ? "gap-3 px-3 lg:justify-center lg:px-0"
                    : "gap-3 px-3"
                }
              `}
            >
              <UserPlus size={19} className="shrink-0" />
              <span className={isCollapsed ? "lg:hidden" : ""}>Sign Up</span>
            </button>
          </>
        )}

        <div
          className={`mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 ${
            isCollapsed ? "lg:hidden" : ""
          }`}
        >
          <Sparkles size={13} />
          <span>Powered by AI</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
