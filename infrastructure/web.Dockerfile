# GhimTech Tax web — production image (Next.js standalone output)
FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ghimtech/web

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN addgroup -S ghimtech && adduser -S ghimtech -G ghimtech
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER ghimtech
EXPOSE 3000
LABEL org.opencontainers.image.title="GhimTech Tax Web" \
      org.opencontainers.image.vendor="GhimTech" \
      org.opencontainers.image.authors="Durga Ghimeray"
CMD ["node", "apps/web/server.js"]
