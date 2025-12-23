#!/bin/bash

# Database Backup Script
# 
# This script creates a backup of your database before running migrations
# 
# Usage:
#   chmod +x backup_database.sh
#   ./backup_database.sh

# ============================================================================
# Configuration - UPDATE THESE VALUES
# ============================================================================

# Database connection details
# Option 1: Using connection string
# DB_CONNECTION_STRING="postgresql://user:password@host:port/database"

# Option 2: Using individual variables (for Supabase)
DB_HOST="${SUPABASE_DB_HOST:-db.your-project.supabase.co}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-your-password}"

# Backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_before_migration_${TIMESTAMP}.sql"

# ============================================================================
# Create backup directory if it doesn't exist
# ============================================================================

mkdir -p "$BACKUP_DIR"

# ============================================================================
# Create backup
# ============================================================================

echo "=========================================="
echo "Database Backup Script"
echo "=========================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "ERROR: pg_dump not found. Please install PostgreSQL client tools."
    exit 1
fi

# Create backup using connection string (if provided)
if [ ! -z "$DB_CONNECTION_STRING" ]; then
    echo "Creating backup using connection string..."
    pg_dump "$DB_CONNECTION_STRING" > "$BACKUP_FILE"
else
    # Create backup using individual variables
    echo "Creating backup using connection parameters..."
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "${BACKUP_FILE%.sql}.dump" 2>/dev/null || \
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
    unset PGPASSWORD
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✓ Backup created successfully!"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "You can restore this backup with:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
else
    echo "✗ Backup failed!"
    echo "Please check your database connection settings."
    exit 1
fi

echo ""
echo "=========================================="
echo "Backup completed!"
echo "=========================================="

