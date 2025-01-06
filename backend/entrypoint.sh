#!/bin/bash

# Collect static files
echo "Collect static files"
python manage.py collectstatic --no-input

# Start server
#echo "Starting server"
## python3 manage.py runserver 0.0.0.0:8000
#gunicorn core.wsgi:application --bind=0.0.0.0:8000

exec "$@"