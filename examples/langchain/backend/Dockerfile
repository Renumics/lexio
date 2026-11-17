FROM python:3.12.16-slim-trixie@sha256:5e2bdb1b0d542d5039cffb8181c65930093949194a65c365dfb1b0fe13a4fa5b AS base
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    PATH="/app/examples/langchain/backend/.venv/bin:$PATH"
WORKDIR /app/examples/langchain/backend
RUN --mount=from=ghcr.io/astral-sh/uv:0.13.7@sha256:96f40d3904aad8d0bd010539001d36c8e2188b981e1334471a90c4a1d93bb490,source=/uv,target=/bin/uv \
    --mount=type=cache,id=lexio-uv,target=/root/.cache/uv \
    --mount=type=bind,source=examples/langchain/backend/pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=examples/langchain/backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=python/lexio/pyproject.toml,target=/app/python/lexio/pyproject.toml \
    uv sync --locked --no-dev --no-install-project --no-install-package lexio

FROM base AS prod
COPY examples/langchain/backend/pyproject.toml examples/langchain/backend/uv.lock ./
COPY examples/langchain/backend/src ./src
COPY python/lexio/pyproject.toml python/lexio/README.md /app/python/lexio/
COPY python/lexio/lexio /app/python/lexio/lexio
RUN --mount=from=ghcr.io/astral-sh/uv:0.13.7@sha256:96f40d3904aad8d0bd010539001d36c8e2188b981e1334471a90c4a1d93bb490,source=/uv,target=/bin/uv \
    --mount=type=cache,id=lexio-uv,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-editable \
    && mkdir -p data
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
