# Use official Python runtime as base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm install
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Set environment variables
ENV FLASK_APP=src/app.py
ENV FLASK_DEBUG=0

# Expose port
EXPOSE 8080

# Run migrations and start server
CMD ["sh", "-c", "cd src && python -m flask db upgrade && cd .. && gunicorn wsgi --chdir ./src/ --bind 0.0.0.0:8080"]
