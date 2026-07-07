# cooloss — hub d'identité partagé (Blindtoss, Memoss, ...)
# Multi-stage : builder lourd (deps completes) -> runner leger (Node uniquement)

# --- Stage 1 : Build ----------------------------------------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# --- Stage 2 : Runner -----------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

COPY package.json ./
COPY next.config.ts ./
COPY prisma ./prisma/
COPY docker-entrypoint.sh ./

RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/prisma/dev.db"

ENTRYPOINT ["./docker-entrypoint.sh"]
