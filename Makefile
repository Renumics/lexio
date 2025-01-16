# Variables
BACKEND_DIR = fastapi-example
FRONTEND_DIR = rag- das
.PHONY: install-frontend
install-frontend:
	cd $(FRONTEND_DIR) && \
	npm install

# Development targets
.PHONY: dev
dev:
	make -j 2 dev-backend dev-frontend

.PHONY: dev-backend
dev-backend:
	cd $(BACKEND_DIR) && \
	. .venv/bin/activate && \
	uvicorn main:app --reload --port 8000

.PHONY: dev-frontend
dev-frontend:
	cd $(FRONTEND_DIR) && \
	npm run dev

# Clean targets
.PHONY: clean
clean:
	rm -rf $(BACKEND_DIR)/venv
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/data