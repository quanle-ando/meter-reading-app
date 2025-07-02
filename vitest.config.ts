// import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react({ jsxImportSource: "@emotion/react" })],
  test: {
    // include: ["**/*.test.tsx"],
    css: true,
    globals: true,
    environment: "jsdom",
    coverage: {
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      reporter: ["lcov"],
    },
  },
});
