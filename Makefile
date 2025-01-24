# Variables
BACKEND_DIR = fastapi-example
FRONTEND_DIR = rag-ui

# Check for Python installation
PYTHON := $(shell command -v python3 2> /dev/null)
ifndef PYTHON
    $(error "Python3 is not installed. Please install Python3 first: https://www.python.org/downloads/")
endif

# Installation targets
.PHONY: install
install: install-backend install-frontend

.PHONY: install-backend
install-backend:
	cd $(BACKEND_DIR) && \
	python3 -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt
	mkdir -p data

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
	. venv/bin/activate && \
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