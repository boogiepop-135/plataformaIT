#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Node dependencies and build frontend
npm install
npm run build

# Install Python dependencies
pip install -r requirements.txt

# Create database tables if migrations exist
if [ -d "migrations" ]; then
    cd src
    export FLASK_APP=app.py
    python -m flask db upgrade
    cd ..
else
    echo "No migrations directory found, skipping database setup"
fi
