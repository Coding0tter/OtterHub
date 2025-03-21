import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()],
  base: "/budget/",
  server: {
    port: 5175,
  },
  envDir: "../../",
  envPrefix: "OTTER",
  build: {
    target: "esnext",
    outDir: "../../output/dist/budget",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
