import { serve } from "bun";

// COMPILE-TIME INLINING: Burn the predictable un-hashed assets straight into the core binary context heap memory
import indexHtml from "./src/js/dist/index.html" with { type: "text" };
import mainJs from "./src/js/dist/assets/main.js" with { type: "text" };
import mainCss from "./src/js/dist/assets/main.css" with { type: "text" };
import onigWasm from "./public/onig.wasm" with { type: "file" };

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

    if (path === "/" || path === "/index.html") {
      return new Response(indexHtml, { headers: { "Content-Type": "text/html" } });
    }

    if (path === "/assets/main.js" || path.endsWith("out.js")) {
      return new Response(mainJs, { headers: { "Content-Type": "application/javascript" } });
    }
    if (path === "/assets/main.css" || path.endsWith("out.css")) {
      return new Response(mainCss, { headers: { "Content-Type": "text/css" } });
    }

    if (workers[path]) {
      return new Response(workers[path], { headers: { "Content-Type": "application/javascript" } });
    }

    if (path === "/onig.wasm") {
      return new Response(Bun.file(onigWasm), { headers: { "Content-Type": "application/wasm" } });
    }

    return new Response("404 Not Found", { status: 404 });
  },
});
