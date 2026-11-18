FROM node:24.22.2-trixie-slim@sha256:0820eaa85e07d0490446dd01d14707e17e6108a36988cf374899cd057eb3812d AS base
COPY --from=ghcr.io/pnpm/pnpm:12.20.0@sha256:6999b0d11d81065126ef0a226705b9d22eb9b552830d782505043d280c46ff00 /opt/pnpm /opt/pnpm
ENV PATH="/opt/pnpm:$PATH"
WORKDIR /app
RUN --mount=type=cache,id=lexio-pnpm,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=pnpm-workspace.yaml,target=pnpm-workspace.yaml \
    --mount=type=bind,source=lexio/package.json,target=lexio/package.json \
    --mount=type=bind,source=examples/langchain/frontend/package.json,target=examples/langchain/frontend/package.json \
    --mount=type=bind,source=examples/llama-index/frontend/package.json,target=examples/llama-index/frontend/package.json \
    --mount=type=bind,source=examples/rag-ui/frontend/package.json,target=examples/rag-ui/frontend/package.json \
    --mount=type=bind,source=examples/advanced-local-rag/frontend/package.json,target=examples/advanced-local-rag/frontend/package.json \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

FROM base AS build
COPY lexio ./lexio
COPY examples/langchain/frontend ./examples/langchain/frontend
RUN pnpm --filter lexio build && pnpm --filter langchain-frontend build

FROM nginx:alpine@sha256:fed7e14be83cbd2661a75cdc5b872d936cf155d46c327084d30b8df19ae88d72 AS prod
COPY --from=build /app/examples/langchain/frontend/dist /usr/share/nginx/html
COPY examples/langchain/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
