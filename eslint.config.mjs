import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],
    rules: {
      "no-unused-vars": "warn",
    },
  },
  globalIgnores(["dist/**", "node_modules/**", ".next/**", "scripts/**"]),
]);
