FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig*.json ./
COPY apps/web-ui/package.json apps/web-ui/package.json
COPY packages/casdoor/package.json packages/casdoor/package.json
COPY packages/chat-ui/package.json packages/chat-ui/package.json
COPY packages/core/package.json packages/core/package.json

RUN pnpm install --frozen-lockfile --filter @agent-flow/web-ui...

COPY . .

RUN pnpm --filter @agent-flow/web-ui... build

FROM nginx:1.27-alpine

COPY apps/web-ui/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/web-ui/dist /usr/share/nginx/html

EXPOSE 80

