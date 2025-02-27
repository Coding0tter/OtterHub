import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()],
  base: "/fitness",
  server: {
    port: 5174,
  },
  envDir: "../../",
  envPrefix: "OTTER",
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
