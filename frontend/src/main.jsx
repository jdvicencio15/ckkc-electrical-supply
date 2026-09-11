import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <App />
          <Toaster position="top-right" />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);