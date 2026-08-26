#!/bin/bash
set -e

# ---------------------------------------------------------------------------
# SlurmDBD configuration
# ---------------------------------------------------------------------------

echo "Installing slurmdbd configuration..."

cp /tmp/conf/slurmdbd.conf /etc/slurm/slurmdbd.conf
chown slurm:slurm /etc/slurm/slurmdbd.conf
chmod 600 /etc/slurm/slurmdbd.conf


# ---------------------------------------------------------------------------
# MariaDB directories
# ---------------------------------------------------------------------------

install -d \
    -o mysql \
    -g mysql \
    -m 0755 \
    /var/lib/mysql \
    /run/mysqld \
    /var/log/mariadb

chown -R mysql:mysql \
    /var/lib/mysql \
    /run/mysqld \
    /var/log/mariadb


# ---------------------------------------------------------------------------
# Initialize MariaDB
# ---------------------------------------------------------------------------

if [ ! -d /var/lib/mysql/mysql ]; then
    echo "Initializing MariaDB data directory..."

    mariadb-install-db \
        --user=mysql \
        --basedir=/usr \
        --datadir=/var/lib/mysql
fi


# ---------------------------------------------------------------------------
# Start MariaDB
# ---------------------------------------------------------------------------

echo "Starting MariaDB..."

rm -f /var/lib/mysql/mysql.sock
rm -f /run/mysqld/mysqld.pid

mariadbd \
    --user=mysql \
    --datadir=/var/lib/mysql \
    --socket=/var/lib/mysql/mysql.sock \
    --port=3306 \
    --bind-address=0.0.0.0 \
    --pid-file=/run/mysqld/mysqld.pid \
    --log-error=/var/log/mariadb/mariadb.log \
    >/var/log/mariadb/console.log 2>&1 &

MYSQL_PID=$!


# ---------------------------------------------------------------------------
# Wait for MariaDB
# ---------------------------------------------------------------------------

echo "Waiting for MariaDB..."

MYSQL_READY=false

for attempt in $(seq 1 60); do
    if mariadb \
        --socket=/var/lib/mysql/mysql.sock \
        -e "SELECT 1" >/dev/null 2>&1; then

        MYSQL_READY=true
        echo "MariaDB is ready."
        break
    fi

    if ! kill -0 "$MYSQL_PID" 2>/dev/null; then
        echo "MariaDB failed to start." >&2

        echo "--- MariaDB error log ---" >&2
        if [ -f /var/log/mariadb/mariadb.log ]; then
            cat /var/log/mariadb/mariadb.log >&2
        fi

        echo "--- MariaDB console log ---" >&2
        if [ -f /var/log/mariadb/console.log ]; then
            cat /var/log/mariadb/console.log >&2
        fi

        exit 1
    fi

    sleep 1
done

if [ "$MYSQL_READY" != true ]; then
    echo "Timed out waiting for MariaDB." >&2

    echo "--- MariaDB error log ---" >&2
    [ -f /var/log/mariadb/mariadb.log ] &&
        tail -n 100 /var/log/mariadb/mariadb.log >&2 || true

    echo "--- MariaDB console log ---" >&2
    [ -f /var/log/mariadb/console.log ] &&
        tail -n 100 /var/log/mariadb/console.log >&2 || true

    exit 1
fi


# ---------------------------------------------------------------------------
# Create Slurm accounting database
# ---------------------------------------------------------------------------

echo "Creating Slurm accounting database..."

mariadb --socket=/var/lib/mysql/mysql.sock <<'SQL'

CREATE DATABASE IF NOT EXISTS slurm_acct_db;

DROP USER IF EXISTS 'slurm'@'localhost';
DROP USER IF EXISTS 'slurm'@'database';
DROP USER IF EXISTS 'slurm'@'%';

CREATE USER 'slurm'@'localhost'
    IDENTIFIED BY 'password';

CREATE USER 'slurm'@'database'
    IDENTIFIED BY 'password';

CREATE USER 'slurm'@'%'
    IDENTIFIED BY 'password';

GRANT ALL PRIVILEGES
    ON slurm_acct_db.*
    TO 'slurm'@'localhost';

GRANT ALL PRIVILEGES
    ON slurm_acct_db.*
    TO 'slurm'@'database';

GRANT ALL PRIVILEGES
    ON slurm_acct_db.*
    TO 'slurm'@'%';

FLUSH PRIVILEGES;

SQL


# ---------------------------------------------------------------------------
# Verify Slurm database credentials
# ---------------------------------------------------------------------------

echo "Testing Slurm database credentials..."

mariadb \
    -h 127.0.0.1 \
    -P 3306 \
    -u slurm \
    -ppassword \
    slurm_acct_db \
    -e "SELECT USER(), CURRENT_USER(), DATABASE();"

echo "Slurm database setup complete."
