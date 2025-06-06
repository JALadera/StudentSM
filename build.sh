#!/bin/bash
set -o errexit
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --no-input