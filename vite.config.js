import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      // Ensure Svelte dependencies are properly externalized
      compilerOptions: {
        css: "external",
      },
    }),
  ],
  build: {
    lib: {
      entry: "src/lib/index.ts",
      name: "AipSvelteFilter",
      fileName: "index",
    },
    rollupOptions: {
      // Externalize Svelte-related packages to prevent bundling
      external: ["svelte", "svelte/store", "svelte/internal"],
      output: {
        globals: {
          svelte: "Svelte",
          "svelte/store": "SvelteStore",
          "svelte/internal": "SvelteInternal",
        },
      },
    },
  },
  test: {
    globals: true,
    coverage: {
      reporter: ["text", "json", "json-summary", "html", "lcov", "cobertura"],
      exclude: [
        "node_modules/",
        "dist/",
        "filter-peg.js",
        "**/*.d.ts",
        "vitest.setup.ts",
      ],
    },
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
