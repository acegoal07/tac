#!/bin/bash

cp /tmp/conf/slurmdbd.conf /etc/slurm/slurmdbd.conf
chown slurm:slurm /etc/slurm/slurmdbd.conf
chmod 600 /etc/slurm/slurmdbd.conf

install -d -o mysql -g mysql -m 0755 /var/lib/mysql /run/mysqld /var/log/mariadb
chown -R mysql:mysql /var/lib/mysql /run/mysqld /var/log/mariadb

if [ ! -d /var/lib/mysql/mysql ]; then
    echo "Initializing MariaDB data directory..."
    mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql >/dev/null 2>&1
fi

if ! pgrep -x mariadbd >/dev/null 2>&1 || [ ! -S /var/lib/mysql/mysql.sock ]; then
    rm -f /var/lib/mysql/mysql.sock /run/mysqld/mysqld.pid
    echo "Starting MariaDB..."
    mariadbd --user=mysql --datadir=/var/lib/mysql \
        --socket=/var/lib/mysql/mysql.sock \
        --port=3306 \
        --bind-address=127.0.0.1 \
        --pid-file=/run/mysqld/mysqld.pid \
        --log-error=/var/log/mariadb/mariadb.log >/var/log/mariadb/console.log 2>&1 &
fi

for attempt in $(seq 1 60); do
    if [ -S /var/lib/mysql/mysql.sock ] && mariadb --socket=/var/lib/mysql/mysql.sock -e 'SELECT 1' >/dev/null 2>&1; then
        break
    fi

    if ! pgrep -x mariadbd >/dev/null 2>&1; then
        echo "MariaDB failed to start. Logs:" >&2
        [ -f /var/log/mariadb/mariadb.log ] && tail -n 50 /var/log/mariadb/mariadb.log >&2 || true
        [ -f /var/log/mariadb/console.log ] && tail -n 50 /var/log/mariadb/console.log >&2 || true
        exit 1
    fi

    sleep 1
done

echo "Creating Slurm accounting database..."
mariadb --socket=/var/lib/mysql/mysql.sock -e "
    CREATE DATABASE IF NOT EXISTS slurm_acct_db;
    CREATE USER IF NOT EXISTS 'slurm'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL PRIVILEGES ON slurm_acct_db.* TO 'slurm'@'localhost';
    FLUSH PRIVILEGES;
"