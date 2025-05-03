# Stage 1: Build stage
FROM python:3.12.10-slim AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Download the latest uv installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the uv installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Create and activate virtual environment
RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy dependency files (pyproject.toml and requirements.lock)
COPY pyproject.toml requirements.lock ./

COPY entrypoint.sh ./

# Install dependencies including psycopg2-binary
RUN uv pip install -r requirements.lock

# Stage 2: Runtime stage
FROM python:3.12.10-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"
ENV APP_HOME=/home/app/backend

# Install runtime dependencies only (libpq5 for psycopg2)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    gettext && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create non-root user and app directory
RUN useradd -m ubuntu
WORKDIR $APP_HOME

# Change ownership of the WORKDIR itself so the 'ubuntu' user can write to it
RUN chown ubuntu:ubuntu $APP_HOME

# Copy application code with proper ownership
COPY --chown=ubuntu:ubuntu . .

# Switch to non-root user
USER ubuntu

RUN chmod +x ./entrypoint.sh
