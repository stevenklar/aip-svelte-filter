import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  package: {
    dir: "dist",
    exports: (filepath) => {
      return filepath.endsWith(".d.ts") || !filepath.includes("/internal/");
    },
  },
};

export default config;
