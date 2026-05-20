FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json ./
COPY src/js/package.json ./src/js/
RUN cd src/js && bun install

COPY . .
RUN cd src/js && bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app

COPY --from=builder /app/src/js/dist ./src/js/dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./

EXPOSE 3000
CMD ["bun", "run", "server.ts"]
