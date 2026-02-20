// frontend/src/utils/env.js

export const readEnv = (key) => {
  // Vite
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && key in import.meta.env) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }

  // CRA / Webpack
  try {
    if (typeof process !== "undefined" && process.env && key in process.env) {
      return process.env[key];
    }
  } catch {
    // ignore
  }

  return undefined;
};

const trimSlash = (url) => String(url || "").trim().replace(/\/+$/, "");

export const getClientTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
};

export const getApiBaseUrl = () => {
  // Smart fallback: in production use same origin, in dev use localhost
  const envVal = readEnv("REACT_APP_API_URL");
  const raw = envVal
    || (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? window.location.origin + "/api"
      : "http://localhost:5001/api");
  const u = trimSlash(raw);

  // If user already provided .../api
  if (u.endsWith("/api")) return u;

  // If user provided base server URL like http://localhost:5000
  return `${u}/api`;
};

export const getServerBaseUrl = () => {
  const api = getApiBaseUrl();
  // Remove only trailing "/api"
  if (api.endsWith("/api")) return api.slice(0, -4);
  return api;
};
