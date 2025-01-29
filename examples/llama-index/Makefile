# Define variables
BACKEND_DIR=backend
FRONTEND_DIR=frontend
VENV_DIR=.venv

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

# Frontend setup
setup-frontend:
	@echo "Setting up frontend..."
	cd $(FRONTEND_DIR) && npm install 


# Start backend server
start-backend:
	@echo "Starting backend server..."
	cd $(BACKEND_DIR) && PYTHONPATH=. $(VENV_DIR)/bin/python -m uvicorn main_with_highlighting:app --reload


# Start frontend server
start-frontend:
	@echo "Starting frontend server..."
	cd $(FRONTEND_DIR) && npm run dev

# Clean up
clean:
	@echo "Cleaning up..."
	rm -rf $(BACKEND_DIR)/$(VENV_DIR)
	cd $(FRONTEND_DIR) && rm -rf node_modules


# Help
help:
	@echo "Usage:"
	@echo "  make init            - Set up both backend and frontend environments"
	@echo "  make setup-backend   - Set up the backend environment"
	@echo "  make setup-frontend  - Set up the frontend environment"
	@echo "  make start-backend   - Start the backend server"
	@echo "  make start-frontend  - Start the frontend server"
	@echo "  make clean           - Clean up the environment"
	@echo "  make help            - Display this help message"
