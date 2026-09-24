# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# docker compose: the repo is bind-mounted over /app for watch mode, while
# node_modules (installed here, for Linux) is kept in an anonymous volume.
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "start:dev"]

FROM deps AS build
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Default stage: what a plain `docker build .` produces.
FROM base AS prod
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
CMD ["node", "dist/main"]
