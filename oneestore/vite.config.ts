import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works at a domain root or from a project subpath.
export default defineConfig({
  base: process.env.VITE_BASE ?? "./",
  plugins: [react()],
});
