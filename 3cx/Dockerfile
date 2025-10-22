FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Build TypeScript
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Run as non-root user
USER node

# Expose port for health checks
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
