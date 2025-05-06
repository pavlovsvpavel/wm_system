#!/usr/bin/env python3
import subprocess
import datetime
import sys
from pathlib import Path
from decouple import Config, RepositoryEnv
from google.cloud import storage

env_path = Path(__file__).parent.parent / 'envs' / '.env.prod'
config = Config(RepositoryEnv(env_path))

CONTAINER_NAME = config("CONTAINER_NAME")
POSTGRES_USER = config("POSTGRES_USER")
GCS_BUCKET_NAME = config("GCS_BUCKET_NAME")
GCS_DESTINATION_FOLDER = config("GCS_DESTINATION_FOLDER")
BACKUP_DIR = Path(__file__).parent
LOG_FILE = BACKUP_DIR / "backup.log"


def log_message(message, level="INFO"):
    """Helper function to log messages to a file."""
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] [{level}] {message}\n"

    with open(LOG_FILE, "a") as f:
        f.write(log_entry)
        print(log_entry)


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

        if not is_container_running():
            log_message(f"Container {CONTAINER_NAME} is not running", "ERROR")
            return None

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

        # Compress the backup and get the compressed path
        compressed_path = compress_backup(backup_path)

        return compressed_path

    except subprocess.CalledProcessError as err:
        error_msg = err.stderr.strip() if err.stderr else str(err)
        log_message(f"Backup failed. Command failed with return code {err.returncode}. Error: {error_msg}", "ERROR")
        return None

    except Exception as err:
        log_message(f"Unexpected error during backup: {str(err)}", "ERROR")
        return None


def compress_backup(backup_path):
    """Compress the backup file using gzip"""
    try:
        log_message(f"Starting compression of {backup_path}")
        result = subprocess.run(['gzip', backup_path], stderr=subprocess.PIPE, text=True, check=True)

        if result.stderr:
            log_message(f"Compression warnings: {result.stderr.strip()}", "WARNING")

        compressed_path = backup_path.with_suffix(backup_path.suffix + ".gz")
        log_message(f"Successfully compressed backup to: {backup_path}.gz")

        return compressed_path

    except subprocess.CalledProcessError as err:
        error_msg = err.stderr.strip() if err.stderr else str(err)
        log_message(f"Compression failed. Error: {error_msg}", "ERROR")
        return None

    except Exception as err:
        log_message(f"Unexpected error during compression: {str(err)}", "ERROR")
        return None


def upload_to_gcs(file_path):
    """Upload a file to a GCS bucket using native Python client."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(GCS_BUCKET_NAME)

        destination_blob_name = f"{GCS_DESTINATION_FOLDER}/{file_path.name}" if GCS_DESTINATION_FOLDER else file_path.name
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(str(file_path))
        log_message(f"Successfully uploaded {file_path} to gs://{GCS_BUCKET_NAME}/{destination_blob_name}")

    except Exception as err:
        log_message(f"GCS upload failed: {str(err)}", "ERROR")


if __name__ == "__main__":
    try:
        log_message("Starting backup script execution...")

        compressed_backup_path = create_backup()

        if not compressed_backup_path:
            log_message("Backup process completed with errors", "ERROR")
            sys.exit(1)

        upload_to_gcs(compressed_backup_path)

        log_message("Backup and upload process completed successfully")

    except Exception as e:
        log_message(f"Fatal error in main execution: {str(e)}", "CRITICAL")
        sys.exit(1)
