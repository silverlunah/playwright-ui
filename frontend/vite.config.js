import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    exclude: [
      "chunk-SGTBCKV5.js", // Add the problematic chunks you need to exclude
      "chunk-5X5FQIXE.js",
      "chunk-JSNX54OE.js",
      // Add any other dependencies that you know are causing issues
    ],
  },
});
