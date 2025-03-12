# Stage 1: Build Lexio UI package
FROM node:20-slim AS lexio-builder
WORKDIR /app/lexio

# Copy Lexio package files
COPY lexio /app/lexio

# Install dependencies and build Lexio
RUN npm install
RUN npm run build

# Stage 2: Build frontend with Lexio dependency
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package files
COPY examples/langchain/frontend /app/frontend
RUN rm -rf node_modules && rm package-lock.json

# Install dependencies (including local Lexio package) and build frontend
RUN npm cache clean --force
RUN npm install

# Copy built Lexio package
COPY --from=lexio-builder /app/lexio /app/lexio
RUN npm install /app/lexio

# Build frontend
RUN npm run build

# Stage 3: Production environment
FROM nginx:alpine
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY examples/langchain/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 