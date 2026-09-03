import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GitHub Pages serves 404.html for unknown paths. Copying index.html there
 * lets BrowserRouter handle deep links such as /showcase/workcell.
 */
function spaFallback(): PluginOption {
  let outDir = path.resolve(__dirname, "docs");
  return {
    name: "spa-fallback-404",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const index = path.join(outDir, "index.html");
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.join(outDir, "404.html"));
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    spaFallback(),
    visualizer() as PluginOption,
  ],
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
      "src/fleet/**/*.test.ts",
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
          leaflet: ["leaflet", "react-leaflet"],
        },
      },
    },
  },
});
