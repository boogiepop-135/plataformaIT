#!/usr/bin/env bash
# Railway database initialization script

# Set Flask app
export FLASK_APP=src/app.py

# Initialize database
cd src
python3 -m flask db upgrade
echo "Database initialized successfully"
