import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": process.env.VITE_BACKEND_URL ?? "http://localhost:3000",
      "/media": process.env.VITE_BACKEND_URL ?? "http://localhost:3000",
      "/legacy-admin": process.env.VITE_BACKEND_URL ?? "http://localhost:3000",
    },
  },
});
