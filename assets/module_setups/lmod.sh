#!/bin/bash
# ============================================================
# Hierarchical (Lmod-style) Modulefile Tree
# For use with environment-modules on Rocky 9
# Run on login node — all nodes see /data via NFS
# ============================================================

set -e

MODULEFILES_DIR="/data/modulefiles"
APPS_DIR="/data/apps"

# --- Ensure base dirs exist ---
sudo mkdir -p "$MODULEFILES_DIR/Core"
sudo mkdir -p "$APPS_DIR"

# ============================================================
# Helper: create a dummy app directory
# ============================================================
create_app_dir() {
    local app_path="$1"
    local app_name="$2"
    local app_version="$3"

    sudo mkdir -p "$app_path/bin" "$app_path/lib" "$app_path/include" "$app_path/share"

    sudo tee "$app_path/bin/${app_name}" > /dev/null << EOF
#!/bin/bash
echo "${app_name} ${app_version} (demo)"
echo "Installed at: \$(dirname \$0)"
EOF
    sudo chmod +x "$app_path/bin/${app_name}"
}

# ============================================================
# Helper: create parent dir for a modulefile
# ============================================================
prep_modfile() {
    sudo mkdir -p "$(dirname "$1")"
}

# ============================================================
# 1. GCC — Core level (visible by default)
# ============================================================
APP="gcc"
VER="12.2.0"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/Core/$APP/$VER"

create_app_dir "$APP_PATH" "$APP" "$VER"
prep_modfile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# GCC 12.2.0 — GNU Compiler Collection
#

proc ModulesHelp { } {
    puts stderr "GCC 12.2.0 — GNU C/C++/Fortran compilers"
    puts stderr "This is a Core module — loading it reveals MPI and other"
    puts stderr "compiler-dependent modules."
    puts stderr ""
    puts stderr "Load with: module load gcc/12.2.0"
}

module-whatis   "GCC 12.2.0 — GNU Compiler Collection (Core)"

set             app_dir      /data/apps/gcc/12.2.0

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
setenv          GCC_VERSION  12.2.0

# --- THE KEY BIT: reveal compiler-dependent modules ---
prepend-path    MODULEPATH   /data/modulefiles/Compiler/gcc/12.2.0
EOFMOD

# ============================================================
# 2. Python — Core level (no dependencies)
# ============================================================
APP="python"
VER="3.11.4"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/Core/$APP/$VER"

create_app_dir "$APP_PATH" "python3" "$VER"
sudo tee "$APP_PATH/bin/pip3" > /dev/null << 'EOF'
#!/bin/bash
echo "pip3 (demo) — would install Python packages"
EOF
sudo chmod +x "$APP_PATH/bin/pip3"
prep_modfile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# Python 3.11.4 — Python interpreter
#

proc ModulesHelp { } {
    puts stderr "Python 3.11.4 — general-purpose programming language"
    puts stderr "This is a Core module — no dependencies."
    puts stderr ""
    puts stderr "Load with: module load python/3.11.4"
}

module-whatis   "Python 3.11.4 — interpreter and pip (Core)"

set             app_dir      /data/apps/python/3.11.4

prepend-path    PATH         $app_dir/bin
prepend-path    LIBRARY_PATH $app_dir/lib
prepend-path    LD_LIBRARY_PATH $app_dir/lib
prepend-path    MANPATH      $app_dir/share/man

setenv          PYTHON_HOME  $app_dir
setenv          PYTHONPATH   $app_dir/lib/python3.11
EOFMOD

# ============================================================
# 3. OpenMPI — Compiler level (revealed by gcc/12.2.0)
# ============================================================
APP="openmpi"
VER="4.1.5"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/Compiler/gcc/12.2.0/$APP/$VER"

create_app_dir "$APP_PATH" "mpirun" "$VER"
sudo tee "$APP_PATH/bin/mpicc" > /dev/null << 'EOF'
#!/bin/bash
echo "mpicc (demo) — would wrap gcc with MPI flags"
EOF
sudo chmod +x "$APP_PATH/bin/mpicc"
prep_modfile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# OpenMPI 4.1.5 — built with GCC 12.2.0
#

proc ModulesHelp { } {
    puts stderr "OpenMPI 4.1.5 — Message Passing Interface"
    puts stderr "Built with: gcc/12.2.0"
    puts stderr "Loading this reveals MPI-dependent modules (gromacs, etc.)"
    puts stderr ""
    puts stderr "Load with: module load openmpi/4.1.5"
    puts stderr "(requires gcc/12.2.0 already loaded)"
}

module-whatis   "OpenMPI 4.1.5 — MPI runtime (built with gcc/12.2.0)"

# Require GCC — error out if not loaded
if { ![is-loaded gcc/12.2.0] } {
    puts stderr "ERROR: gcc/12.2.0 must be loaded first"
    break
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
setenv          MPI_VERSION  4.1.5

# --- THE KEY BIT: reveal MPI-dependent modules ---
prepend-path    MODULEPATH   /data/modulefiles/MPI/gcc/12.2.0/openmpi/4.1.5
EOFMOD

# ============================================================
# 4. GROMACS — MPI level (revealed by openmpi/4.1.5)
# ============================================================
APP="gromacs"
VER="2023.3"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/MPI/gcc/12.2.0/openmpi/4.1.5/$APP/$VER"

create_app_dir "$APP_PATH" "gmx" "$VER"
prep_modfile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# GROMACS 2023.3 — built with GCC 12.2.0 + OpenMPI 4.1.5
#

proc ModulesHelp { } {
    puts stderr "GROMACS 2023.3 — molecular dynamics simulation"
    puts stderr "Built with: gcc/12.2.0 + openmpi/4.1.5"
    puts stderr ""
    puts stderr "Load with: module load gromacs/2023.3"
    puts stderr "(requires gcc/12.2.0 and openmpi/4.1.5 already loaded)"
}

module-whatis   "GROMACS 2023.3 — molecular dynamics (gcc/12.2.0 + openmpi/4.1.5)"

if { ![is-loaded openmpi/4.1.5] } {
    puts stderr "ERROR: openmpi/4.1.5 must be loaded first"
    break
}

set             app_dir      /data/apps/gromacs/2023.3

prepend-path    PATH         $app_dir/bin
prepend-path    LIBRARY_PATH $app_dir/lib
prepend-path    LD_LIBRARY_PATH $app_dir/lib
prepend-path    MANPATH      $app_dir/share/man

setenv          GROMACS_HOME $app_dir
EOFMOD

# ============================================================
# 5. Apptainer — MPI level (revealed by openmpi/4.1.5)
# ============================================================
APP="apptainer"
VER="1.2.4"
APP_PATH="$APPS_DIR/$APP/$VER"
MOD_FILE="$MODULEFILES_DIR/MPI/gcc/12.2.0/openmpi/4.1.5/$APP/$VER"

create_app_dir "$APP_PATH" "apptainer" "$VER"
sudo tee "$APP_PATH/bin/singularity" > /dev/null << 'EOF'
#!/bin/bash
echo "singularity (demo compat shim) — redirects to apptainer"
EOF
sudo chmod +x "$APP_PATH/bin/singularity"
prep_modfile "$MOD_FILE"

sudo tee "$MOD_FILE" > /dev/null << 'EOFMOD'
#%Module1.0
#
# Apptainer 1.2.4 — HPC containers (built with gcc/12.2.0 + openmpi/4.1.5)
#

proc ModulesHelp { } {
    puts stderr "Apptainer 1.2.4 — HPC container runtime"
    puts stderr "Provides: apptainer, singularity (compat)"
    puts stderr "Built with: gcc/12.2.0 + openmpi/4.1.5"
    puts stderr ""
    puts stderr "Load with: module load apptainer/1.2.4"
}

module-whatis   "Apptainer 1.2.4 — HPC containers (gcc/12.2.0 + openmpi/4.1.5)"

if { ![is-loaded openmpi/4.1.5] } {
    puts stderr "ERROR: openmpi/4.1.5 must be loaded first"
    break
}

set             app_dir      /data/apps/apptainer/1.2.4

prepend-path    PATH         $app_dir/bin
prepend-path    MANPATH      $app_dir/share/man

setenv          APPTAINER_HOME    $app_dir
setenv          SINGULARITY_HOME  $app_dir
EOFMOD

# ============================================================
# Set sensible permissions
# ============================================================
sudo chmod -R a+rX "$MODULEFILES_DIR"
sudo chmod -R a+rX "$APPS_DIR"

# ============================================================
# Summary
# ============================================================
echo ""
echo "========================================"
echo " Hierarchical modulefile tree created!"
echo "========================================"
echo ""
echo " Tree structure:"
echo "   /data/modulefiles/"
echo "   ├── Core/                          ← default MODULEPATH"
echo "   │   ├── gcc/12.2.0                 ← reveals Compiler/gcc/12.2.0/"
echo "   │   └── python/3.11.4"
echo "   ├── Compiler/gcc/12.2.0/           ← revealed by gcc/12.2.0"
echo "   │   ├── openmpi/4.1.5              ← reveals MPI/gcc/12.2.0/openmpi/4.1.5/"
echo "   └── MPI/gcc/12.2.0/openmpi/4.1.5/  ← revealed by openmpi/4.1.5"
echo "       ├── gromacs/2023.3"
echo "       └── apptainer/1.2.4"
echo ""
echo " IMPORTANT: Update your MODULEPATH to point to Core only:"
echo "   module use /data/modulefiles/Core"
echo ""
echo " Demo walkthrough:"
echo "   module avail              # see only gcc + python"
echo "   module load gcc/12.2.0    # now openmpi appears"
echo "   module avail              # see openmpi"
echo "   module load openmpi/4.1.5 # now gromacs + apptainer appear"
echo "   module avail              # see gromacs + apptainer"
echo "   module load gromacs/2023.3"
echo "   module list               # see all 4 loaded"
echo ""
echo "   module purge              # unload everything"
echo "   module avail              # back to just gcc + python"
echo ""