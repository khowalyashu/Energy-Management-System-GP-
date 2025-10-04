# ------------ Build stage ------------
FROM node:20-alpine AS deps
WORKDIR /app
# Only copy the manifests first to maximize layer cache
COPY package*.json ./
RUN npm ci --omit=dev

# ------------ Runtime stage ------------
FROM node:20-alpine AS runner
WORKDIR /app

# Set production env
ENV NODE_ENV=production
# Useful at runtime for your /api/student endpoint
ENV PORT=3000

# Create a non-root user for better security
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp
USER nodeusr

# Copy app source
COPY --chown=nodeusr:nodegrp . .

# Copy node_modules from deps stage
COPY --from=deps --chown=nodeusr:nodegrp /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Default command
CMD [ "node", "server.js" ]