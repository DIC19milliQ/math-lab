import path from "node:path";
import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = process.cwd();

export default defineConfig({
  root: projectRoot,
  // GitHub project Pages publishes this repository below /math-lab/.
  base: "/math-lab/",
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
  resolve: { preserveSymlinks: true, alias: { "@": `${path.resolve(projectRoot)}/` } },
});
