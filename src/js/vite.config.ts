import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "../"), // Maps the root directory up out of js/ to locate index.html cleanly
  base: "./",
  plugins: [
    monacoEditorPlugin({
      languages: ["json"]
    })
  ],
  build: {
    outDir: resolve(__dirname, "dist"), // Outputs compilation files directly to /src/js/dist
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});
