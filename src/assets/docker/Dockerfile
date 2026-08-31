FROM rockylinux:9.3 AS base

ARG SLURM_VERSION=26.05.1

RUN dnf -y install dnf-plugins-core && \
    dnf config-manager --set-enabled crb || true && \
    dnf -y install epel-release && \
    dnf -y update && \
    dnf clean all


RUN dnf -y install \
    gcc \
    gcc-c++ \
    make \
    wget \
    bzip2 \
    openssl-devel \
    readline-devel \
    ncurses-devel \
    perl \
    munge \
    munge-devel \
    mariadb-devel \
    openssh-clients \
    sudo \
    && \
    dnf clean all

RUN groupadd -r slurm && \
    useradd -r -g slurm slurm

RUN useradd -m dev && \
    echo "dev ALL=(ALL) NOPASSWD:ALL" \
        > /etc/sudoers.d/dev && \
    chmod 0440 /etc/sudoers.d/dev

RUN mkdir -p \
        /var/log/munge \
        /var/lib/munge \
        /run/munge \
        /etc/munge && \
    chown -R munge:munge \
        /var/log/munge \
        /var/lib/munge \
        /run/munge \
        /etc/munge && \
    chmod 700 \
        /var/log/munge \
        /var/lib/munge \
        /run/munge

WORKDIR /usr/src

RUN wget -O slurm.tar.bz2 \
    https://download.schedmd.com/slurm/slurm-${SLURM_VERSION}.tar.bz2 && \
    tar -xjf slurm.tar.bz2

WORKDIR /usr/src/slurm-${SLURM_VERSION}

RUN ./configure \
    --prefix=/usr/local/slurm \
    --sysconfdir=/etc/slurm \
    --with-munge \
    --with-mysql \
    --disable-dependency-tracking

RUN make -j$(nproc) && \
    make install

RUN mkdir -p \
        /etc/slurm \
        /var/log/slurm \
        /slurm/state \
        /slurm/spool && \
    chown -R slurm:slurm \
        /var/log/slurm \
        /slurm

ENV PATH="/usr/local/slurm/bin:/usr/local/slurm/sbin:$PATH"

RUN echo \
    'export PATH=/usr/local/slurm/bin:/usr/local/slurm/sbin:$PATH' \
    > /etc/profile.d/slurm.sh

RUN echo 'CgroupPlugin=disabled' \
    > /etc/slurm/cgroup.conf

WORKDIR /


FROM base AS login

RUN dnf -y install \
    openssh-server \
    && \
    dnf clean all

COPY entrypoint-login.sh /entrypoint.sh

RUN chmod +x \
    /entrypoint.sh

EXPOSE 22

CMD ["/entrypoint.sh"]



FROM base AS compute

RUN dnf -y install \
    openssh-server \
    && \
    dnf clean all

COPY entrypoint-compute.sh /entrypoint.sh

RUN chmod +x \
    /entrypoint.sh

EXPOSE 22

CMD ["/entrypoint.sh"]

FROM base AS database

RUN dnf -y install \
    mariadb-server \
    && \
    dnf clean all

COPY entrypoint-database.sh /entrypoint.sh
COPY setup_scripts/database.sh /tmp/setup_scripts/database.sh

RUN chmod +x \
    /entrypoint.sh \
    /tmp/setup_scripts/database.sh

CMD ["/entrypoint.sh"]