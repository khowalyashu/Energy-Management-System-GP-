FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app

# production deps
COPY --from=deps /usr/src/app/node_modules ./node_modules
# app source
COPY . .

# Make sure your app listens on 0.0.0.0:PORT inside container
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
