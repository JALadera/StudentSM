#!/bin/bash
set -e  # Exit on error

cd backend

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Applying database migrations ==="
python manage.py makemigrations || echo "No new migrations to apply"
python manage.py migrate

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Build completed successfully ==="