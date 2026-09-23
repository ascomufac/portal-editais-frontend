# Build Next.js (standalone)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# npm ci runs prepare, which needs the Git hook setup script.
COPY scripts/setup-git-hooks.mjs ./scripts/setup-git-hooks.mjs
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_SITE_URL=http://localhost:8080
ARG PLONE_ORIGIN=https://www3.ufac.br
ARG PLONE_REVALIDATE_DAYS=1
ARG NEXT_PUBLIC_APP_VERSION=0.0.0
ARG NEXT_PUBLIC_GIT_SHA=unknown
ARG NEXT_PUBLIC_BUILD_TIME=

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV PLONE_ORIGIN=$PLONE_ORIGIN
ENV PLONE_REVALIDATE_DAYS=$PLONE_REVALIDATE_DAYS
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_GIT_SHA=$NEXT_PUBLIC_GIT_SHA
ENV NEXT_PUBLIC_BUILD_TIME=$NEXT_PUBLIC_BUILD_TIME

RUN npm run build

# Runtime Node standalone
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
