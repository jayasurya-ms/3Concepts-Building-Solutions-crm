import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Mock Node.js modules for browser compatibility with xlsx-js-style
      stream: path.resolve(__dirname, "./src/lib/node-mocks.js"),
      fs: path.resolve(__dirname, "./src/lib/node-mocks.js"),
      process: "process/browser",
      buffer: "buffer",
    },
  },
});