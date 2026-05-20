import { serve } from "bun";

// COMPILE-TIME INLINING: Assets are burned straight into the executable's core binary memory data array
import indexHtml from "./src/js/dist/index.html" with { type: "text" };
import mainJs from "./src/js/dist/assets/index.js" with { type: "text" };
import mainCss from "./src/js/dist/assets/index.css" with { type: "text" };
import onigWasm from "./public/onig.wasm" with { type: "file" };

// Inline the un-hashed background web workers compiled via the Monaco plugin hook
const workers: { [key: string]: string } = {
  "/assets/json.worker.js": await import("./src/js/dist/assets/json.worker.js") with { type: "text" },
  "/assets/editor.worker.js": await import("./src/js/dist/assets/editor.worker.js") with { type: "text" }
};

const PORT = 3000;
console.log(`Local Standalone D2 Playground running securely at http://localhost:${PORT}`);

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route top-level root pathings directly to the inlined index template string
    if (path === "/" || path === "/index.html") {
      return new Response(indexHtml, { headers: { "Content-Type": "text/html" } });
    }

    // Serve core packaged resource chunks from application memory storage cells
    if (path === "/assets/index.js" || path.endsWith("out.js")) {
      return new Response(mainJs, { headers: { "Content-Type": "application/javascript" } });
    }
    if (path === "/assets/index.css" || path.endsWith("out.css")) {
      return new Response(mainCss, { headers: { "Content-Type": "text/css" } });
    }

    // Match and dispatch deterministic Monaco worker calls directly from RAM mapping coordinates
    if (workers[path]) {
      return new Response(workers[path], { headers: { "Content-Type": "application/javascript" } });
    }

    // Stream out the localized Regex environment token processor WASM context payload file structure
    if (path === "/onig.wasm") {
      return new Response(Bun.file(onigWasm), { headers: { "Content-Type": "application/wasm" } });
    }

    return new Response("404 Not Found", { status: 404 });
  },
});
