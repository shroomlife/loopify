FROM node:20-alpine

ENV NODE_ENV=development

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

# Copy only necessary files from the builder stage
COPY .output /usr/src/nuxt-app/.output
COPY node_modules /usr/src/nuxt-app/node_modules

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
