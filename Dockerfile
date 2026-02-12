# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only dependency files first (for caching)
COPY package.json package-lock.json* ./

# Install all deps needed for build
RUN npm install

# Copy remaining source
COPY . .

# Build frontend (Vite)
RUN npm run build


# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy dependency files
COPY package.json package-lock.json* ./

# Install only production deps
RUN npm install --omit=dev && npm cache clean --force

# Copy built assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Create data directory
RUN mkdir -p data

EXPOSE 3000

CMD ["npm", "run", "server"]
