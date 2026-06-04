FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig*.json ./
COPY apps/web-server/package.json apps/web-server/package.json
COPY packages/compact/package.json packages/compact/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/events/package.json packages/events/package.json
COPY packages/logger-js/package.json packages/logger-js/package.json
COPY packages/memory/package.json packages/memory/package.json
COPY packages/model-adapters/package.json packages/model-adapters/package.json
COPY packages/tools-impl/package.json packages/tools-impl/package.json

RUN pnpm install --frozen-lockfile --filter @agent-flow/web-server...

COPY . .

RUN pnpm --filter @agent-flow/web-server... build
RUN pnpm --filter @agent-flow/web-server --prod deploy --legacy /workspace/deploy/web-server

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /workspace/deploy/web-server ./
COPY --from=builder /workspace/protocol ./protocol

RUN mkdir -p /app/logs \
  && chown -R node:node /app

USER node

EXPOSE 9200 9201

CMD ["node", "dist/index.js"]
