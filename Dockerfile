# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend (Vite)
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy server code
COPY --from=builder /app/server ./server

# Ensure data directory exists
RUN mkdir -p data

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "server"]
