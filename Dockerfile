# Build stage
FROM node:16-alpine AS builder

ENV SPOTIFY_REDIRECT_URL=https://loopify.pro

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . .

RUN npm install

ENV NODE_ENV=production
RUN npm run build

# Runtime stage
FROM node:20-alpine

ENV NODE_ENV=production

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/nuxt-app/.output /usr/src/nuxt-app/.output
COPY --from=builder /usr/src/nuxt-app/node_modules /usr/src/nuxt-app/node_modules

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
