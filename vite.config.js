import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: "src/lib/index.ts",
      name: "AipSvelteFilter",
      fileName: "index",
    },
    rollupOptions: {
      external: ["svelte"],
      output: {
        globals: {
          svelte: "Svelte",
        },
      },
    },
  },
  test: {
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
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
