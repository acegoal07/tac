FROM rockylinux:9

# Install base stuff and enable extra modules
RUN dnf -y install dnf-plugins-core && \
   dnf config-manager --set-enabled crb || true && \
   dnf -y install epel-release

# Install modules required to build slurm
RUN dnf -y install \
   gcc gcc-c++ make wget bzip2 \
   openssl-devel readline-devel \
   ncurses-devel perl \
   wget munge munge-devel \
   openssh-server openssh-clients sudo \
   mariadb-server mariadb-devel \
   && dnf clean all

# Add slurm group and user
RUN groupadd -r slurm && useradd -r -g slurm slurm

# Add MariaDB system account and the login user
RUN getent group mysql >/dev/null || groupadd -r mysql && \
   getent passwd mysql >/dev/null || useradd -r -g mysql -d /var/lib/mysql -s /sbin/nologin mysql && \
   useradd -m dev

# Make the dev user a sudouser
RUN echo "dev ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/dev && \
   chmod 0440 /etc/sudoers.d/dev

# Create munge dirs with correct permissions
RUN mkdir -p /var/log/munge /var/lib/munge /run/munge && \
   chown -R munge:munge /var/log/munge /var/lib/munge /run/munge && \
   chmod 700 /var/log/munge /var/lib/munge /run/munge

WORKDIR /usr/src

# Download and build slurm
ARG SLURM_VERSION=26.05.1

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

RUN make -j$(nproc) && make install

# Make slurm dirs
RUN mkdir -p \
   /etc/slurm \
   /var/log/slurm \
   /slurm/state /slurm/spool && \
   chown -R slurm:slurm \
   /var/log/slurm \
   /slurm

ENV PATH="/usr/local/slurm/bin:/usr/local/slurm/sbin:$PATH"
RUN echo 'export PATH=/usr/local/slurm/bin:/usr/local/slurm/sbin:$PATH' \
   > /etc/profile.d/slurm.sh

RUN echo 'CgroupPlugin=disabled' > /etc/slurm/cgroup.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]