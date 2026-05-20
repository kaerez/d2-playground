import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    // Automatically injects, chunks, and structures the web workers for Monaco at build time
    monacoEditorPlugin({
      languages: ["json"] // Enables tokenizers used internally for schema configuration mappings
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
