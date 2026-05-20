# D2 Playground

[![Production Compile, Container Release & Pages Deploy](https://github.com/kaerez/d2-playground/actions/workflows/deploy.yml/badge.svg)](https://github.com/kaerez/d2-playground/actions/workflows/deploy.yml)

An online runner to play, learn, and create with [D2](https://d2lang.com), the modern diagram scripting language that turns text to diagrams.

<div align="center">
  <img src="https://play.d2lang.com/assets/images/og.png" alt="D2 Playground Overview" />
</div>

## System Architecture
This repository has been fully modernized into a secure, zero-dependency Single Page Application (SPA).
* **Compiler & Bundler:** [Bun](https://bun.sh/) & [Vite](https://vitejs.dev/)
* **Editor Core:** Monaco (VSCode Engine) with optimized Web Worker isolation.
* **Layout Engines:** 100% Local WebAssembly execution (Dagre / ELK). *All proprietary remote tracking APIs have been explicitly stripped to guarantee offline operational capability and zero data leakage.*

---

## How to Host Your Own Playground

We distribute the playground in multiple formats so you can run it on your own infrastructure with or without installing dependencies. Navigate to the **[GitHub Releases](../../releases)** page to download the necessary artifacts.

### Option 1: Standalone Offline Executables (No Dependencies Required)
We compile the entire web application directly into a single, offline binary executable. You do not need Node, Bun, Python, or a Web Server installed to run this.

1. Download the binary matching your system architecture from the Releases page:
   * **Windows:** `d2-playground-win-x64.exe`
   * **macOS:** `d2-playground-mac-arm64` (Apple Silicon) or `d2-playground-mac-x64` (Intel)
   * **Linux:** `d2-playground-linux-x64` (Standard), `linux-arm64` (Raspberry Pi/Graviton), `linux-x64-baseline` (Legacy CPUs), or `musl` variants (Alpine).
2. Open your terminal and grant execution permissions (Mac/Linux only): `chmod +x d2-playground-*`
3. Execute the binary: `./d2-playground-linux-x64`
4. Access the playground immediately at `http://localhost:3000`.

### Option 2: Docker Environments
We publish a lightweight, multi-stage Alpine container to the GitHub Container Registry (`ghcr.io`). You can run it via Compose, standard Docker, or rebuild it entirely from source.

#### A. Using Docker Compose (Recommended)
1. Download `docker-compose.yml` from the repository root (or the Releases page).
2. Run the deployment sequence:
   ```bash
   docker compose up -d
   ```
3. The isolated container environment will boot and expose the editor on port `3000`.

#### B. Without Docker Compose (Standard Docker Run)
If you prefer not to use Compose, you can pull and run the image directly from the registry:
```bash
docker run -d -p 3000:3000 --name d2-playground-sandbox ghcr.io/kaerez/d2-playground:latest
```

#### C. Full Rebuild from Source
If you have modified the source code and want to rebuild the Docker image locally from scratch:
```bash
# 1. Clone the repository
git clone [https://github.com/kaerez/d2-playground.git](https://github.com/kaerez/d2-playground.git)
cd d2-playground

# 2. Build the Docker image locally
docker build -t d2-playground-local .

# 3. Run the locally built image
docker run -d -p 3000:3000 --name d2-playground-sandbox d2-playground-local
```

### Option 3: Plain Web Assets (For Nginx, Apache, IIS, Caddy)
If you already have a web server and just want to host the static files without dealing with binaries or Docker, use the pre-built asset package.

1. Download `d2-playground-web-assets.zip` from the Releases page.
2. Unzip the contents directly into your web server's public document root (e.g., `/var/www/html/` for Nginx).
3. The playground will automatically route assets and operate normally via your existing domain configuration. No backend compilation or proxy configurations are needed.

### Option 4: Local Development & Source Compilation (Requires Bun)
If you want to modify the code, adjust the Monaco themes, or compile your own custom layouts, you can run the source code natively using the Bun runtime.

```bash
# 1. Clone the repository
git clone [https://github.com/kaerez/d2-playground.git](https://github.com/kaerez/d2-playground.git)
cd d2-playground/src/js

# 2. Install lightning-fast dependencies
bun install

# 3. Start the hot-reloading development server
bun run dev

# 4. (Optional) Build production static assets
bun run build

# 5. (Optional) Compile your own native single-file executables
bun run build:executables
```
