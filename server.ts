import { serve } from "bun";

// COMPILE-TIME INLINING: Files are read during bundling and compiled directly into the binary heap
import indexHtml from "./src/js/dist/index.html" with { type: "text" };
import outJs from "./src/js/dist/assets/index.js" with { type: "text" };
import outCss from "./src/js/dist/assets/index.css" with { type: "text" };
import onigWasm from "./public/onig.wasm" with { type: "file" };

// Dynamic asset map for layout engine elements compiled into chunks by the Monaco plugin
const chunks: { [key: string]: string } = {
  "json.worker.js": await import("./src/js/dist/assets/json.worker.js") with { type: "text" },
  "editor.worker.js": await import("./src/js/dist/assets/editor.worker.js") with { type: "text" }
};

const PORT = 3000;
console.log(`Local Isolated D2 Playground running securely at http://localhost:${PORT}`);

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route root traffic to memory-inlined index string
    if (path === "/" || path === "/index.html") {
      return new Response(indexHtml, { headers: { "Content-Type": "text/html" } });
    }

    // Route core application logic bundles directly out of the memory heap
    if (path === "/assets/index.js" || path.endsWith("out.js")) {
      return new Response(outJs, { headers: { "Content-Type": "application/javascript" } });
    }
    if (path === "/assets/index.css" || path.endsWith("out.css")) {
      return new Response(outCss, { headers: { "Content-Type": "text/css" } });
    }

    // Route optimized Monaco background thread workers dynamically from memory
    for (const [chunkName, chunkContent] of Object.entries(chunks)) {
      if (path.endsWith(chunkName)) {
        return new Response(chunkContent, { headers: { "Content-Type": "application/javascript" } });
      }
    }

    // Serve WebAssembly engine context from the compiled file reference buffer
    if (path === "/onig.wasm") {
      return new Response(Bun.file(onigWasm), { headers: { "Content-Type": "application/wasm" } });
    }

    return new Response("404 Not Found", { status: 404 });
  },
});
