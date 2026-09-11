import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import settingsService from "../services/settingsService";
import { DEFAULT_APP_CONFIG } from "../config/appConfig";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_APP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await settingsService.getSettings();

      if (!response?.success || !response?.settings) {
        throw new Error("Invalid settings response.");
      }

      setSettings(response.settings);
    } catch (err) {
      console.error(
        "Failed to load application settings:",
        err,
      );

      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);


const loadPublicConfig = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response =
      await settingsService.getPublicConfig();

    if (!response?.success || !response?.config) {
      throw new Error("Invalid public config response.");
    }

    setSettings((current) => ({
      ...current,

      businessName:
        response.config.businessName ||
        current.businessName,

      appearance: {
        ...current.appearance,

        systemName:
          response.config.systemName ||
          current.appearance?.systemName,

        logo:
          response.config.logo ||
          current.appearance?.logo,
      },
    }));
  } catch (err) {
    console.error(
      "Failed to load public application config:",
      err,
    );

    setError(err);
  } finally {
    setLoading(false);
  }
}, []);


useEffect(() => {
  if (authLoading) {
    return;
  }

  if (!isAuthenticated) {
    loadPublicConfig();
    return;
  }

  loadSettings();
}, [
  authLoading,
  isAuthenticated,
  loadPublicConfig,
  loadSettings,
]);

  const refreshSettings = useCallback(() => {
    return loadSettings();
  }, [loadSettings]);

  // =====================================================
  // BUSINESS IDENTITY
  // =====================================================

  const businessName = settings?.businessName || "";
  const systemName = settings?.appearance?.systemName || "APP";

  return (
    <SettingsContext.Provider
      value={{
        settings,
        businessName,
        systemName,
        loading,
        error,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within a SettingsProvider",
    );
  }

  return context;
}

export default SettingsContext;