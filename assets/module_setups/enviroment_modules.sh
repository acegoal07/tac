#!/bin/bash
# ============================================================
# Demo HPC Modulefiles Setup
# Creates example modulefiles + matching app dirs under /data
# Run on login node (NFS server) — all nodes will see /data
# ============================================================

set -e

MODULEFILES_DIR="/data/modulefiles"
APPS_DIR="/data/apps"

# --- Ensure base dirs exist ---
sudo mkdir -p "$MODULEFILES_DIR"
sudo mkdir -p "$APPS_DIR"

# ============================================================
# Helper: create a dummy app directory with bin/, lib/, etc.
# ============================================================
create_app_dir() {
    local app_path="$1"
    local app_name="$2"
    local app_version="$3"

    sudo mkdir -p "$app_path/bin" "$app_path/lib" "$app_path/include" "$app_path/share"

    # Dummy binary that just prints version info
    sudo tee "$app_path/bin/${app_name}" > /dev/null << EOF
#!/bin/bash
echo "${app_name} ${app_version} (demo)"
echo "Installed at: \$(dirname \$0)"
EOF
    sudo chmod +x "$app_path/bin/${app_name}"
}

# ============================================================
# Helper: create parent dir and write a modulefile
# ============================================================
write_modulefile() {
    local modfile="$1"
    sudo mkdir -p "$(dirname "$modfile")"
}

# ============================================================
# 1. GCC (Compiler)
# ============================================================
APP="gcc"
VER="12.2.0"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/$APP/$VER"

create_app_dir "$APP_PATH" "$APP" "$VER"
write_modulefile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# GCC 12.2.0 — GNU Compiler Collection
#

proc ModulesHelp { } {
    puts stderr "GCC 12.2.0 — GNU C/C++/Fortran compilers"
    puts stderr "Load with: module load gcc/12.2.0"
}

module-whatis   "GCC 12.2.0 — GNU Compiler Collection"

set             app_dir      /data/apps/gcc/12.2.0
set             app_ver      12.2.0

prepend-path    PATH         $app_dir/bin
prepend-path    LIBRARY_PATH $app_dir/lib
prepend-path    LD_LIBRARY_PATH $app_dir/lib
prepend-path    C_INCLUDE_PATH  $app_dir/include
prepend-path    CPLUS_INCLUDE_PATH $app_dir/include
prepend-path    MANPATH      $app_dir/share/man

setenv          CC           gcc
setenv          CXX          g++
setenv          FC           gfortran
setenv          GCC_HOME     $app_dir
EOFMOD

# ============================================================
# 2. OpenMPI (MPI stack — depends on GCC)
# ============================================================
APP="openmpi"
VER="4.1.5"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/$APP/$VER"

create_app_dir "$APP_PATH" "mpirun" "$VER"
sudo tee "$APP_PATH/bin/mpicc" > /dev/null << 'EOF'
#!/bin/bash
echo "mpicc (demo) — would wrap gcc with MPI flags"
EOF
sudo chmod +x "$APP_PATH/bin/mpicc"
write_modulefile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# OpenMPI 4.1.5 — MPI runtime and development
#

proc ModulesHelp { } {
    puts stderr "OpenMPI 4.1.5 — Message Passing Interface"
    puts stderr "Requires: gcc/12.2.0"
    puts stderr "Load with: module load openmpi/4.1.5"
}

module-whatis   "OpenMPI 4.1.5 — MPI runtime"

# Depend on GCC
if { ![is-loaded gcc/12.2.0] } {
    module load gcc/12.2.0
}

set             app_dir      /data/apps/openmpi/4.1.5

prepend-path    PATH         $app_dir/bin
prepend-path    LIBRARY_PATH $app_dir/lib
prepend-path    LD_LIBRARY_PATH $app_dir/lib
prepend-path    C_INCLUDE_PATH  $app_dir/include
prepend-path    CPLUS_INCLUDE_PATH $app_dir/include
prepend-path    MANPATH      $app_dir/share/man

setenv          MPI_HOME     $app_dir
setenv          MPICC        $app_dir/bin/mpicc
setenv          MPIEXEC      $app_dir/bin/mpirun
EOFMOD

# ============================================================
# 3. Python (with venv-style setup)
# ============================================================
APP="python"
VER="3.11.4"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/$APP/$VER"

create_app_dir "$APP_PATH" "python3" "$VER"
sudo tee "$APP_PATH/bin/pip3" > /dev/null << 'EOF'
#!/bin/bash
echo "pip3 (demo) — would install Python packages"
EOF
sudo chmod +x "$APP_PATH/bin/pip3"
write_modulefile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# Python 3.11.4 — Python interpreter
#

proc ModulesHelp { } {
    puts stderr "Python 3.11.4 — general-purpose programming language"
    puts stderr "Load with: module load python/3.11.4"
}

module-whatis   "Python 3.11.4 — interpreter and pip"

set             app_dir      /data/apps/python/3.11.4

prepend-path    PATH         $app_dir/bin
prepend-path    LIBRARY_PATH $app_dir/lib
prepend-path    LD_LIBRARY_PATH $app_dir/lib
prepend-path    MANPATH      $app_dir/share/man

setenv          PYTHON_HOME  $app_dir
setenv          PYTHONPATH   $app_dir/lib/python3.11
EOFMOD

# ============================================================
# 4. Singularity / Apptainer (Containers)
# ============================================================
APP="apptainer"
VER="1.2.4"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/$APP/$VER"

create_app_dir "$APP_PATH" "apptainer" "$VER"
sudo tee "$APP_PATH/bin/singularity" > /dev/null << 'EOF'
#!/bin/bash
echo "singularity (demo compat shim) — redirects to apptainer"
EOF
sudo chmod +x "$APP_PATH/bin/singularity"
write_modulefile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# Apptainer 1.2.4 — container system for HPC (formerly Singularity)
#

proc ModulesHelp { } {
    puts stderr "Apptainer 1.2.4 — HPC container runtime"
    puts stderr "Provides: apptainer, singularity (compat)"
    puts stderr "Load with: module load apptainer/1.2.4"
}

module-whatis   "Apptainer 1.2.4 — HPC containers"

set             app_dir      /data/apps/apptainer/1.2.4

prepend-path    PATH         $app_dir/bin
prepend-path    MANPATH      $app_dir/share/man

setenv          APPTAINER_HOME $app_dir
setenv          SINGULARITY_HOME $app_dir
EOFMOD

# ============================================================
# 5. GROMACS (Molecular dynamics — classic HPC app)
# ============================================================
APP="gromacs"
VER="2023.3"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/$APP/$VER"

create_app_dir "$APP_PATH" "gmx" "$VER"
write_modulefile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# GROMACS 2023.3 — Molecular dynamics simulation package
#

proc ModulesHelp { } {
    puts stderr "GROMACS 2023.3 — molecular dynamics"
    puts stderr "Requires: gcc/12.2.0, openmpi/4.1.5"
    puts stderr "Load with: module load gromacs/2023.3"
}

module-whatis   "GROMACS 2023.3 — molecular dynamics"

# Depend on compiler + MPI
if { ![is-loaded openmpi/4.1.5] } {
    module load openmpi/4.1.5
}

set             app_dir      /data/apps/gromacs/2023.3

prepend-path    PATH         $app_dir/bin
prepend-path    LIBRARY_PATH $app_dir/lib
prepend-path    LD_LIBRARY_PATH $app_dir/lib
prepend-path    MANPATH      $app_dir/share/man

setenv          GROMACS_HOME $app_dir
EOFMOD

# ============================================================
# Set sensible permissions on everything
# ============================================================
sudo chmod -R a+rX "$MODULEFILES_DIR"
sudo chmod -R a+rX "$APPS_DIR"

# ============================================================
# Summary
# ============================================================
echo ""
echo "========================================"
echo " Demo modulefiles created!"
echo "========================================"
echo ""
echo " Modulefiles under: $MODULEFILES_DIR"
echo " App binaries under: $APPS_DIR"
echo ""
echo " Available modules:"
echo "   gcc/12.2.0          — GNU compiler"
echo "   openmpi/4.1.5       — MPI (depends on gcc)"
echo "   python/3.11.4       — Python 3"
echo "   apptainer/1.2.4     — HPC containers"
echo "   gromacs/2023.3      — Molecular dynamics (depends on openmpi)"
echo ""
echo " Test with:"
echo "   module avail"
echo "   module load gromacs/2023.3"
echo "   module list"
echo "   which gmx"
echo "   gmx"
echo ""