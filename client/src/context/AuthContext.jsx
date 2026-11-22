import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authActionError, setAuthActionError] = useState("");

  const pendingActionRef = useRef(null);

  const isAuthenticated = Boolean(token && user);

  const saveSession = (data) => {
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    pendingActionRef.current = null;
    setAuthActionError("");
  }, []);

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setAuthActionError("");
    setIsAuthModalOpen(true);
  }, []);

  // Use this before any action that requires an authenticated user.
  const requireAuth = useCallback(
    (action, mode = "login") => {
      if (isAuthenticated) {
        action?.();
        return true;
      }

      pendingActionRef.current = action || null;
      openAuthModal(mode);

      return false;
    },
    [isAuthenticated, openAuthModal],
  );

  const finishAuthentication = async () => {
    setIsAuthModalOpen(false);
    setAuthActionError("");

    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;

    if (pendingAction) {
      try {
        await pendingAction();
      } catch {
        setAuthActionError(
          "You are signed in, but the requested action could not be completed. Please try again.",
        );
      }
    }
  };

  const register = async (userData) => {
    const data = await registerUser(userData);

    saveSession(data);
    await finishAuthentication();

    return data;
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    saveSession(data);
    await finishAuthentication();

    return data;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    pendingActionRef.current = null;
    setIsAuthModalOpen(false);
    setAuthActionError("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        register,
        login,
        logout,
        requireAuth,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        authActionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
