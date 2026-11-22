import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  /* Vitest settings */
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      /* Leave out files that are not app code */
      exclude: [
        "src/main.jsx",
        "src/tests/**",
        "**/*.test.{js,jsx}",
        "**/*.config.js",
      ],
      /* The coverage run fails if any of these drop below 65% */
      thresholds: {
        lines: 65,
        statements: 65,
        functions: 65,
        branches: 65,
      },
    },
  },
});
