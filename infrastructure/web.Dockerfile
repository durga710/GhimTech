# GhimTech Tax web — production image (Next.js standalone output)
FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

FROM base AS build
# The API origin is baked into the client bundle at build time; Railway (and
# other CI) pass it through as a build argument.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@ghimtech/web

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn* \
  && addgroup -S ghimtech && adduser -S ghimtech -G ghimtech
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
