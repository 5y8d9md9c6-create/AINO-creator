import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: false,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@react-three")
          ) {
            return "three-vendor";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion-vendor";
          }
        },
      },
    },
  },
});
