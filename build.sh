#!/bin/bash
# Build script for Render

# Exit on error
set -o errexit

# Change to backend directory
cd backend

# Install python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input