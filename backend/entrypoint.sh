#!/bin/sh
set -e

# Configurable defaults
WORKERS=${GUNICORN_WORKERS:-$((2 * $(nproc)))}
TIMEOUT=${GUNICORN_TIMEOUT:-30}

# Skip if flag exists
if [ -n "$SKIP_ENTRYPOINT" ]; then
  exec "$@"
  exit 0
fi

# Django setup
echo "----- Running migrations -----"
python manage.py makemigrations --no-input
python manage.py migrate --no-input

echo "----- Collecting static files -----"
python manage.py collectstatic --no-input

# Start server
echo "----- Starting Gunicorn with $WORKERS workers (timeout: $TIMEOUT) -----"
exec gunicorn core.wsgi:application \
    --bind=0.0.0.0:8000 \
    --workers="$WORKERS" \
    --timeout="$TIMEOUT" \
    --access-logfile - \
    --error-logfile -
