
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

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm generate:prompts
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV SERVE_STATIC=/app/apps/frontend/dist
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prompts ./prompts
COPY --from=builder /app/llm-presets ./llm-presets
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/package.json ./package.json

EXPOSE ${APP_PORT}
CMD ["npm", "run", "start:prod"]
