import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { slideImagesFromPublic } from "./vite.slide-images-plugin.js";

export default defineConfig({
  plugins: [react(), slideImagesFromPublic()],
});
