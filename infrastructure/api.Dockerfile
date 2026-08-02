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

FROM base AS runtime
ENV NODE_ENV=production
RUN addgroup -S ghimtech && adduser -S ghimtech -G ghimtech
COPY --from=build /app /app
USER ghimtech
EXPOSE 4000
LABEL org.opencontainers.image.title="GhimTech Tax API" \
      org.opencontainers.image.vendor="GhimTech" \
      org.opencontainers.image.authors="Durga Ghimeray"
CMD ["node", "apps/api/dist/index.js"]
