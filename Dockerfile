
FROM node:20-alpine AS base

ENV CI=true
ARG APP_PORT=3100
ENV APP_PORT=${APP_PORT}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN apk update
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

# COPY package.json pnpm-lock.yaml ./
COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm build

RUN pnpm prune --prod

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prompts ./prompts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY docker/entrypoint.sh docker/wait-for-db.js ./docker/

RUN chmod +x docker/entrypoint.sh

EXPOSE ${APP_PORT}
ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
