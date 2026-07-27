import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy API requests to the Express server during development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/screenshots": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
