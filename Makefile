# Makefile for running both backend and frontend in development

.PHONY: dev backend frontend

# Run both backend and frontend in parallel
dev:
	@echo "Starting backend and frontend..."
	@trap 'kill 0' SIGINT; \
	( cd backend/src && source ../.venv/bin/activate && uvicorn app:app --reload ) & \
	( cd frontend && npm run dev ) & \
	wait

# Run only the backend
backend:
	cd backend/src && source ../.venv/bin/activate && uvicorn app:app --reload

# Run only the frontend
frontend:
	cd frontend && npm run dev

# Stop all (for future extension, not implemented here)
stop:
	@echo "Use Ctrl+C to stop the servers."
