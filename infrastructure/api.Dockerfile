# GhimTech Tax API — production image
FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ghimtech/api
# Production-only bundle: the app package with pruned prod dependencies.
RUN pnpm --filter=@ghimtech/api deploy --prod --legacy /out

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
# Patch OS packages and remove package-manager tooling (npm/corepack and their
# bundled dependencies) — the runtime needs only the node binary.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn* \
  && addgroup -S ghimtech && adduser -S ghimtech -G ghimtech
WORKDIR /app
COPY --from=build /out /app
USER ghimtech
EXPOSE 4000
LABEL org.opencontainers.image.title="GhimTech Tax API" \
      org.opencontainers.image.vendor="GhimTech" \
      org.opencontainers.image.authors="Durga Ghimeray"
CMD ["node", "dist/index.js"]
