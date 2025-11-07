# redSpec.AI Dockerfile
# Multi-stage build for optimal image size

# Stage 1: Python dependencies
FROM python:3.11-slim as python-builder

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Node.js build
FROM node:18-alpine as nodejs-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Runtime
FROM python:3.11-slim

# Install Node.js in the runtime image
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1001 redspec

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=python-builder /root/.local /home/redspec/.local
ENV PATH=/home/redspec/.local/bin:$PATH

# Copy Node.js application from builder
COPY --from=nodejs-builder /app/.next ./.next
COPY --from=nodejs-builder /app/node_modules ./node_modules
COPY --from=nodejs-builder /app/package*.json ./
COPY --from=nodejs-builder /app/public ./public

# Copy source code
COPY . .

# Set correct permissions
RUN chown -R redspec:redspec /app
USER redspec

# Environment variables
ENV PYTHONPATH=/app:$PYTHONPATH
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/chat || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
