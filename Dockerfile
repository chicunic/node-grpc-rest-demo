# Dependencies stage
FROM node:22-alpine AS deps

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (skip postinstall scripts)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build stage
FROM deps AS builder

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and use cached dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Remove dev dependencies (keep only production)
RUN pnpm prune --prod

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/proto ./proto
COPY --from=builder --chown=nodejs:nodejs /app/swagger.json ./swagger.json

# Switch to non-root user
USER nodejs

# Expose port (app uses PORT env var, defaults to 8080)
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["pnpm", "start"]
