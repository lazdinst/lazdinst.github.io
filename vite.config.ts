import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer() as PluginOption],
  build: {
    outDir: "docs", // Build output directory
    chunkSizeWarningLimit: 500, // Suppress chunk size warnings (optional)
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          react: ["react", "react-dom"],
          three: ["three"],
        },
      },
    },
  },
});
