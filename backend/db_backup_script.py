#!/usr/bin/env python3
import subprocess
import datetime
import os
import sys
from pathlib import Path

# Configuration
CONTAINER_NAME = "wm_app_postgres"
POSTGRES_USER = "postgres"
BACKUP_DIR = Path(__file__).parent / "postgres_backups"


def create_backup():
    """Create a PostgreSQL backup from Docker container"""
    try:
        # Create backup directory if not exists
        os.makedirs(BACKUP_DIR, exist_ok=True)

        # Generate filename with timestamp
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        backup_file = f"pg_backup_{timestamp}.sql"
        backup_path = os.path.join(BACKUP_DIR, backup_file)

        print(f"Starting PostgreSQL backup from container {CONTAINER_NAME}...")

        with open(backup_path, 'w') as f:
            dump_cmd = [
                'docker', 'exec', CONTAINER_NAME,
                'pg_dumpall', '-U', POSTGRES_USER
            ]
            subprocess.run(dump_cmd, check=True, stdout=f, stderr=subprocess.PIPE)

        print(f"Backup successfully created at: {backup_path}")

        # Compress the backup
        compress_backup(backup_path)
        return True

    except subprocess.CalledProcessError as e:
        print(f"Backup failed with error: {e.stderr.decode('utf-8')}")
        return False
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return False


def compress_backup(backup_path):
    """Compress the backup file using gzip"""
    try:
        print("Compressing backup file...")
        subprocess.run(['gzip', backup_path], check=True)
        print(f"Compressed backup created: {backup_path}.gz")
    except subprocess.CalledProcessError:
        print("Warning: Compression failed (gzip may not be available)")


if __name__ == "__main__":
    if not create_backup():
        sys.exit(1)
