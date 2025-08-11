#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Node dependencies and build frontend
npm install
npm run build

# Install Python dependencies
pip install -r requirements.txt
