# ============================================================
# Dockerfile — Bento-do Backend (Node.js / Express)
# ============================================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:22-alpine AS runner
WORKDIR /app

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy dependencies dari stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src ./src
COPY package.json ./

# Ubah kepemilikan file ke user non-root
RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "./src/server.js"]
