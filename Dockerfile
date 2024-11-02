# Dockerfile.dev
FROM node:20-bullseye-slim

# Install dependencies for Puppeteer and other tools
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    git \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Set up working directory
WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with development packages
RUN pnpm install --frozen-lockfile

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=development

# Expose development port
EXPOSE 8080

# Use tsx watch with env file
CMD ["pnpm", "run", "dev"]