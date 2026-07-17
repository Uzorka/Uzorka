import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base is kept relative so the built app works both at a domain root and from a
// project subpath (e.g. GitHub Pages at /<repo>/). Override with VITE_BASE.
export default defineConfig({
  base: process.env.VITE_BASE ?? "./",
  plugins: [react()],
});
