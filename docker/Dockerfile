# Multi-stage Docker Build für Helix Platform
# Optimiert für Produktions-Deployment

# Stage 1: Build Stage
FROM node:20-alpine AS builder

# Installiere Build-Dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Kopiere Package-Dateien
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Installiere Dependencies
RUN npm ci --only=production && npm cache clean --force

# Kopiere Source Code
COPY . .

# Build Frontend
RUN npm run build

# Stage 2: Production Stage
FROM node:20-alpine AS production

# Installiere Runtime-Dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Erstelle App-Directory
WORKDIR /app

# Kopiere Package-Dateien
COPY package*.json ./

# Installiere nur Production Dependencies
RUN npm ci --only=production && npm cache clean --force

# Kopiere gebauten Code vom Builder Stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/shared ./shared

# Kopiere notwendige Konfigurationsdateien
COPY --from=builder /app/database ./database
COPY --from=builder /app/server/config ./server/config

# Setze Permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose Port
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Starte App mit dumb-init für korrekte Signal-Behandlung
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
