#!/usr/bin/env python3
import subprocess
import datetime
import sys
from pathlib import Path

# Configuration
APP_DIR = Path(__file__).parent.parent
CERTBOT_COMPOSE_FILE = "docker-compose-certbot.yml"
DOCKER_COMPOSE_FILE = "docker-compose-prod.yml"
SSL_RENEWAL_DIR = APP_DIR / "ssl_renewal"

def log_message(message, log_file=f"{SSL_RENEWAL_DIR}/renewal.log"):
    """Helper function to log messages to a file."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file, "a") as f:
        f.write(f"[{timestamp}] {message}\n")

def ssl_renewal():
    """Renewal for Let's Encrypt SSL certificate"""
    try:
        log_message("Starting SSL renewal process...")

        # Step 1: Run certbot renew command
        renew_command = [
            "docker", "compose",
            "-f", str(APP_DIR / CERTBOT_COMPOSE_FILE),
            "run", "-T", "--rm", "certbot", "renew"
        ]
        result = subprocess.run(renew_command, cwd=APP_DIR, capture_output=True, text=True, check=True)

        # Log output (stdout & stderr)
        if result.stdout:
            log_message(f"Certbot output: {result.stdout.strip()}")
        if result.stderr:
            log_message(f"Certbot warnings: {result.stderr.strip()}")

        # Step 2: Recreate nginx container
        recreate_command = [
            "docker", "compose",
            "-f", str(APP_DIR / DOCKER_COMPOSE_FILE),
            "up", "-d", "--force-recreate", "nginx"
        ]
        subprocess.run(recreate_command, cwd=APP_DIR, check=True)

        log_message("SSL renewal completed successfully.")
        return True

    except subprocess.CalledProcessError as e:
        log_message(f"Renewal failed. Error: {e.stderr.strip() if e.stderr else str(e)}")
        return False
    except Exception as e:
        log_message(f"Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    if not ssl_renewal():
        sys.exit(1)

