import { defineConfig } from "vite";
import monacoEditorPluginModule from "vite-plugin-monaco-editor";
import { resolve } from "path";

// ESM Interop Fallback: Extracts the function whether Node wraps it in a default object or not
const monacoEditorPlugin = (monacoEditorPluginModule as any).default || monacoEditorPluginModule;

export default defineConfig({
  root: resolve(__dirname, "../"), 
  base: "./",
  plugins: [
    monacoEditorPlugin({
      languages: ["json"]
    })
  ],
  build: {
    outDir: resolve(__dirname, "dist"), 
    emptyOutDir: true,
    // FIXED: Increased to 15000 to silence the expected 11MB bundle warning
    chunkSizeWarningLimit: 15000, 
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});
