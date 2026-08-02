# GhimTech Tax worker — production image
FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ghimtech/worker
RUN pnpm --filter=@ghimtech/worker deploy --prod --legacy /out

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn* \
  && addgroup -S ghimtech && adduser -S ghimtech -G ghimtech
WORKDIR /app
COPY --from=build /out /app
USER ghimtech
LABEL org.opencontainers.image.title="GhimTech Tax Worker" \
      org.opencontainers.image.vendor="GhimTech" \
      org.opencontainers.image.authors="Durga Ghimeray"
CMD ["node", "dist/index.js"]
