const configuredAdminPath = import.meta.env.VITE_ADMIN_PATH;

if (configuredAdminPath && !/^[A-Za-z0-9_-]{32}$/.test(configuredAdminPath)) {
  throw new Error("VITE_ADMIN_PATH must be exactly 32 URL-safe characters.");
}

export const ADMIN_PATH = configuredAdminPath
  ? `/${configuredAdminPath}`
  : "/admin";

export function adminUrl(suffix = ""): string {
  if (!suffix) return ADMIN_PATH;
  return `${ADMIN_PATH}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}
