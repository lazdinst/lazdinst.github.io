import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer() as PluginOption],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: [
      "src/simulation/**/*.test.ts",
      "src/robotics/**/*.test.ts",
      "src/workcell/**/*.test.ts",
      "src/perception/**/*.test.ts",
      "src/app/hotkeys/**/*.test.ts",
    ],
    environment: "node",
  },
  build: {
    outDir: "docs",
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          three: ["three"],
        },
      },
    },
  },
});
