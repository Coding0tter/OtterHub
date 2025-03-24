import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()],
  base: "/",
  envDir: "../../",
  envPrefix: "OTTER",
  server: {
    port: 5173,
  },
  build: {
    target: "esnext",
    outDir: "../../output/dist/gateway",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
