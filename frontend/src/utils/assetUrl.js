// frontend/src/utils/assetUrl.js
import { getServerBaseUrl } from "./env";

/**
 * Get the backend server origin for serving static assets (images, uploads, etc.)
 * Works for both localhost and production deployments.
 */
export const getApiOrigin = () => {
  return getServerBaseUrl();
};

/**
 * Construct a full URL for an uploaded asset (profile images, logos, etc.)
 * Handles: absolute URLs, relative paths like "uploads/images/xyz.jpg"
 * Works on both localhost (http://localhost:5001) and server (https://www.smarthrms.cloud)
 */
export const getAssetUrl = (path) => {
  if (!path) return null;
  if (typeof path !== "string") return null;
  if (path.startsWith("http")) return path;

  const origin = getServerBaseUrl();
  const clean = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${origin}/${clean}`;
};

