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

if [ "$ROLE" != "database" ]; then
    if [ "$MODULE_FRAMEWORK" = "em" ]; then
        echo "Installing Environment Modules..."
        dnf install -y environment-modules

        echo 'module use /data/modulefiles' > /etc/profile.d/z01_modulefiles.sh

        echo "Running Environment Modules setup..."
        bash /tmp/setup_scripts/environment_modules.sh

    elif [ "$MODULE_FRAMEWORK" = "lmod" ]; then
        echo "Installing Lmod..."
        dnf install -y Lmod

        echo 'module use /data/modulefiles/Core' > /etc/profile.d/z01_modulefiles.sh

        echo "Running Lmod setup..."
        bash /tmp/setup_scripts/lmod.sh
    fi
fi

rm -rf /home/dev/setup_scripts

echo "Starting munged..."
runuser -u munge -- munged

if [ "$ROLE" = "login" ]; then
    echo "Starting slurmctld..."
    slurmctld -Dvvv &
    exec /usr/sbin/sshd -D
elif [ "$ROLE" = "compute" ]; then
    echo "Starting slurmd..."
    slurmd -Dvvv &
    exec /usr/sbin/sshd -D
elif [ "$ROLE" = "database" ]; then
    bash /tmp/setup_scripts/database.sh

    echo "Starting slurmdbd..."
    exec slurmdbd -Dvvv
fi