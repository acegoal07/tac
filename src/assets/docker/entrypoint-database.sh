#!/bin/bash

# runtime dirs
install -d -o munge -g munge -m 0700 /var/log/munge /var/lib/munge
install -d -o munge -g munge -m 0711 /run/munge

cp /tmp/conf/slurm.conf /etc/slurm/slurm.conf
chown slurm:slurm /etc/slurm/slurm.conf
chmod 644 /etc/slurm/slurm.conf

if [ -f /tmp/munge.key ]; then
    install -m 400 -o munge -g munge /tmp/munge.key /etc/munge/munge.key
fi

rm -rf /home/dev/setup_scripts

echo "Starting munged..."
runuser -u munge -- munged

bash /tmp/setup_scripts/database.sh

echo "Starting slurmdbd..."
exec slurmdbd -Dvvv