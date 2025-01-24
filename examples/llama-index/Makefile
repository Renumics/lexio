# Define variables
BACKEND_DIR=backend
FRONTEND_DIR=frontend
VENV_DIR=$(BACKEND_DIR)/.venv

# Default target
all: setup-backend setup-frontend

# Init target
init: setup-backend setup-frontend

# Backend setup
setup-backend:
	@echo "Setting up backend..."
	cd $(BACKEND_DIR) && python -m venv $(VENV_DIR)
	@echo "Activating virtual environment and installing backend dependencies..."
	cd $(BACKEND_DIR) && $(VENV_DIR)/bin/pip install -r requirements.txt
	@echo "Backend setup complete. Don't forget to create a .env file with your OpenAI API key."

# Frontend setup
setup-frontend:
	@echo "Setting up frontend..."
	cp -r ../../rag-ui/dist/ $(FRONTEND_DIR)/rag-ui
	mv $(FRONTEND_DIR)/rag-ui/dist/package.json $(FRONTEND_DIR)/rag-ui/package.json
	cd $(FRONTEND_DIR) && npm install &&  npm install rag-ui


# Start backend server
start-backend:
	@echo "Starting backend server..."
	cd $(BACKEND_DIR) && $(VENV_DIR)/bin/python -m uvicorn main:app --reload


# Start frontend server
start-frontend:
	@echo "Starting frontend server..."
	cd $(FRONTEND_DIR) && npm run dev

# Clean up
clean:
	@echo "Cleaning up..."
	rm -rf $(VENV_DIR)
	cd $(FRONTEND_DIR) && rm -rf node_modules

# Indexing target
index:
	@echo "Running document indexing..."
	cd $(BACKEND_DIR) && $(VENV_DIR)/bin/python src/indexing.py

# Help
help:
	@echo "Makefile for langchain-demo"
	@echo "Usage:"
	@echo "  make init            - Set up both backend and frontend environments"
	@echo "  make setup-backend   - Set up the backend environment"
	@echo "  make setup-frontend  - Set up the frontend environment"
	@echo "  make start-backend   - Start the backend server"
	@echo "  make start-frontend  - Start the frontend server"
	@echo "  make clean           - Clean up the environment"
	@echo "  make index           - Run document indexing"
	@echo "  make help            - Display this help message"
