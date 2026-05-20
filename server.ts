import { serve } from "bun";
import { join } from "path";

const PORT = 3000;
const DIST_DIR = join(import.meta.dir, "src/js/dist");
const PUBLIC_DIR = join(import.meta.dir, "public");

console.log(`Local Standalone D2 Playground running securely at http://localhost:${PORT}`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/" || path === "/index.html") {
      path = "/index.html";
    }

    // 1. Attempt to serve from the Vite compiled distribution directory
    const distFile = Bun.file(join(DIST_DIR, path));
    if (await distFile.exists()) {
      return new Response(distFile);
    }

    // 2. Fallback to serving root assets (WASM, panzoom, snippets) from the public directory
    const publicFile = Bun.file(join(PUBLIC_DIR, path.replace(/^\//, "")));
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }

    return new Response("404 Not Found", { status: 404 });
  },
});
