FROM ghcr.io/astral-sh/uv:0.13.7 AS uv
FROM python:3.12.16-slim
COPY --from=uv /uv /uvx /bin/
WORKDIR /app
COPY examples/langchain/backend /app/examples/langchain/backend
COPY python/lexio /app/python/lexio
WORKDIR /app/examples/langchain/backend
RUN uv sync --locked --no-dev
RUN mkdir -p data
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
