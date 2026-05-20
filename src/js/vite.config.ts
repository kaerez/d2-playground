import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    // Automatically compiles and structures the web workers for Monaco at build time
    monacoEditorPlugin({
      languages: ["json"]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000
  }
});
