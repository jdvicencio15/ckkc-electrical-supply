
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
    const savedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    const savedToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);

    setUser(response.user);
    setToken(response.token);

    localStorage.setItem(
      "user",
      JSON.stringify(response.user)
    );

    localStorage.setItem("token", response.token);

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

