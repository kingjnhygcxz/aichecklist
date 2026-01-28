# -------- build stage --------
FROM node:20-slim AS build
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Keep only production dependencies
RUN npm prune --omit=dev

# -------- runtime stage (clean, no Nix) --------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Copy attached assets if needed by the app
COPY --from=build /app/attached_assets ./attached_assets

# Cloud Run uses PORT env var (default 8080)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:'+(process.env.PORT||8080)+'/api/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

# Start the application
CMD ["node", "dist/index.js"]
