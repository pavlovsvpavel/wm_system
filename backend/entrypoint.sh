#!/bin/bash

echo "Collect static files"
python manage.py collectstatic --no-input

echo "Migrate database"
python manage.py migrate

exec "$@"