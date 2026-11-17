FROM node:24.22.2-slim AS builder
COPY --from=ghcr.io/pnpm/pnpm:12.20.0 /opt/pnpm /opt/pnpm
ENV PATH="/opt/pnpm:$PATH"
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lexio ./lexio
COPY examples ./examples
RUN pnpm install --frozen-lockfile
RUN pnpm --filter lexio build && pnpm --filter langchain-frontend build

FROM nginx:alpine
COPY --from=builder /app/examples/langchain/frontend/dist /usr/share/nginx/html
COPY examples/langchain/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
