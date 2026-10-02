import { fileURLToPath } from "node:url";
import { defineConfig } from "cypress";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  video: false,
  numTestsKeptInMemory: 0,
  retries: 0,
  viewportWidth: 1280,
  viewportHeight: 900,
  fixturesFolder: false,
  screenshotsFolder: "tests/artifacts/screenshots",
  downloadsFolder: "tests/artifacts/downloads",
  component: {
    specPattern: "tests/component/**/*.cy.tsx",
    supportFile: "tests/support/component.ts",
    indexHtmlFile: "tests/support/component-index.html",
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        plugins: [react(), tailwindcss()],
        // Tailwind's Vite plugin handles CSS here; avoid also loading Next's
        // PostCSS pipeline and processing the same stylesheet twice.
        css: { postcss: { plugins: [] } },
        resolve: {
          alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
        },
      },
    },
  },
});
