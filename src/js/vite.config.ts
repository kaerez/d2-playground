import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    // This plugin dynamically partitions Monaco's web workers into split distribution chunks
    monacoEditorPlugin({
      languages: ["json"]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Ensures large underlying WASM or library chunks bundle cleanly
    chunkSizeWarningLimit: 2000
  }
});
