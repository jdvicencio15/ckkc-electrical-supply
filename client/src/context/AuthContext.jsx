import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();

        setToken(savedToken);
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

 const login = async (credentials) => {
  const response = await authService.login(credentials);

  setUser(response.user);
  setToken(response.token);

  // Clear previous auth storage
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");

  // Choose storage based on Remember Me
  const storage = credentials.rememberMe
    ? localStorage
    : sessionStorage;

  storage.setItem(
    "user",
    JSON.stringify(response.user)
  );

  storage.setItem("token", response.token);

  return response;
};



  const register = async (userData) => {
    const response = await authService.register(userData);

    return response;
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;