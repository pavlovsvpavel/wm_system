#!/usr/bin/env python3
import subprocess
import datetime
import sys
from pathlib import Path

CONTAINER_NAME = "wm_app_postgres"
POSTGRES_USER = "postgres"
BACKUP_DIR = Path(__file__).parent
LOG_FILE = BACKUP_DIR / "backup.log"


def log_message(message, level="INFO"):
    """Helper function to log messages to a file."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] [{level}] {message}\n"

    with open(LOG_FILE, "a") as f:
        f.write(log_entry)


def is_container_running():
    """Check if postgres container is running."""
    try:
        result = subprocess.run(
            ['docker', 'container', 'inspect', '-f', '{{.State.Running}}', CONTAINER_NAME],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip().lower() == 'true'
    except subprocess.CalledProcessError:
        return False


def create_backup():
    """Create a PostgreSQL backup from Docker container"""
    try:
        log_message(f"Starting PostgreSQL backup from container {CONTAINER_NAME}...")

        # Check if container is running
        if not is_container_running():
            log_message(f"Container {CONTAINER_NAME} is not running", "ERROR")
            return False

        # Generate filename with timestamp
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        backup_file = f"pg_backup_{timestamp}.sql"
        backup_path = Path(BACKUP_DIR, backup_file)

        with open(backup_path, 'w') as f:
            dump_cmd = [
                'docker', 'exec', CONTAINER_NAME,
                'pg_dumpall', '-U', POSTGRES_USER
            ]
            result = subprocess.run(dump_cmd, stdout=f, stderr=subprocess.PIPE, text=True, check=True)

            if result.stderr:
                log_message(f"Backup warnings: {result.stderr.strip()}", "WARNING")

        log_message(f"Backup successfully created at: {backup_path}")

        # Compress the backup
        compress_backup(backup_path)

        return True

    except subprocess.CalledProcessError as err:
        error_msg = err.stderr.strip() if err.stderr else str(err)
        log_message(f"Backup failed. Command failed with return code {err.returncode}. Error: {error_msg}", "ERROR")
        return False

    except Exception as err:
        log_message(f"Unexpected error during backup: {str(err)}", "ERROR")
        return False


def compress_backup(backup_path):
    """Compress the backup file using gzip"""
    try:
        log_message(f"Starting compression of {backup_path}")
        result = subprocess.run(['gzip', backup_path], stderr=subprocess.PIPE, text=True, check=True)

        if result.stderr:
            log_message(f"Compression warnings: {result.stderr.strip()}", "WARNING")

        log_message(f"Successfully compressed backup to: {backup_path}.gz")

    except subprocess.CalledProcessError as err:
        error_msg = err.stderr.strip() if err.stderr else str(err)
        log_message(f"Compression failed. Error: {error_msg}", "ERROR")

    except Exception as err:
        log_message(f"Unexpected error during compression: {str(err)}", "ERROR")


if __name__ == "__main__":
    try:
        if not create_backup():
            log_message("Backup process completed with errors", "ERROR")
            sys.exit(1)
        log_message("Backup process completed successfully")

    except Exception as e:
        log_message(f"Fatal error in main execution: {str(e)}", "CRITICAL")
        sys.exit(1)
