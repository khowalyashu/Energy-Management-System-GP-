# ---- Base runtime ----
FROM node:22-alpine

# Create app dir and set it as workdir
WORKDIR /usr/src/app

# Install deps first 
COPY package*.json ./

RUN npm ci --omit=dev

# Copy the rest of the source 
COPY . .

# Environment
ENV NODE_ENV=production \
    PORT=3000

# Security: run as non-root
USER node

EXPOSE 3000

# Healthcheck (optional; Docker Compose will also have one)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
