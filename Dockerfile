FROM oven/bun:latest AS builder
WORKDIR /app

# Copy lockfiles and configuration specifications first
COPY package.json ./
COPY src/js/package.json ./src/js/
RUN cd src/js && bun install

# Copy source layout and trigger production compile
COPY . .
RUN cd src/js && bun run build

# Production Environment Stage
FROM oven/bun:alpine AS runner
WORKDIR /app

# Pull only the server runner and the optimized static folder block
COPY --from=builder /app/src/js/dist ./src/js/dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./

EXPOSE 3000
CMD ["bun", "run", "server.ts"]
