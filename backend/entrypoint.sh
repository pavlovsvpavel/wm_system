#!/bin/bash

echo "Collect static files"
python manage.py collectstatic --no-input

echo "Make migrations to database"
python manage.py makemigrations

echo "Migrate database"
python manage.py migrate

exec "$@"