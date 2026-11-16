// Preflight check for suites that require the live backend at VITE_API_URL.
// When the backend is unreachable (e.g. GitHub CI builds of this repo, which
// has no backend running), they log a warning and skip instead of failing.
import { execSync } from "node:child_process";

const baseUrl = (process.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

function detectBackend(): boolean {
  try {
    execSync(`curl -sf -m 3 "${baseUrl}/api/health"`, { stdio: "ignore" });
    return true;
  } catch {
    console.warn(
      `Backend not reachable at ${baseUrl}; live API tests will be skipped.`,
    );
    return false;
  }
}

export const backendUp = detectBackend();
