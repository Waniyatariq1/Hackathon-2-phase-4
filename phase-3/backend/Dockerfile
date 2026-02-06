# Hugging Face Spaces Dockerfile for FastAPI Backend
# Port 7860 is required for Hugging Face Spaces

FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 user

# Switch to non-root user
USER user

# Set PATH for user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY --chown=user ./requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=user . /app

# Expose port 7860 (required for Hugging Face Spaces)
EXPOSE 7860

# Run migrations and start server
# Note: Alembic migrations should be run before starting the server
# If DATABASE_URL is not set, migrations will fail but server will still start
# Using app.py as entry point for Hugging Face Spaces
CMD ["sh", "-c", "alembic upgrade head || echo 'Migration failed - check DATABASE_URL secret' && uvicorn app:app --host 0.0.0.0 --port 7860"]

