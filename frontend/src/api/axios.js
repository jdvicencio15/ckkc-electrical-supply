import axios from "axios";
import { toast } from "react-hot-toast";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ==============================
// RESPONSE INTERCEPTOR
// ==============================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    let message = backendMessage || "Something went wrong.";

  if (!backendMessage && status === 400) {
  message = "Invalid request.";
}

if (!backendMessage && status === 401) {
  message = "Your session has expired. Please log in again.";
}

if (!backendMessage && status === 403) {
  message = "You do not have permission to perform this action.";
}

if (!backendMessage && status === 404) {
  message = "The requested resource was not found.";
}

if (!backendMessage && status === 409) {
  message = "This request conflicts with existing data.";
}

if (!backendMessage && status === 429) {
  message = "Too many requests. Please try again later.";
}

if (!backendMessage && status >= 500) {
  message = "Something went wrong on the server.";
}

    toast.error(message);

    return Promise.reject(error);
  }
);

export default API;