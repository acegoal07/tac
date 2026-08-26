# tac - Technically A Cluster

tac is a CLI tool that allows users to create test clusters using docker. It offers the ability to customise the clusters, manage the created clusters, and access them all from within the CLI.

## Requirements:

- `Node.js v24 or higher`
- `Docker installed`

## How to install:

```sh
npm i -g @acegoal07/tac
```

## Available commands:

- `tac help`: Display help information
- `tac connect <cluster_name>`: Connect to an existing cluster
- `tac create`: Create a new cluster
   - `--name=<cluster_name>`: Specify the name of the cluster
   - `--count=<number_of_nodes>`: Specify the number of nodes in the cluster
   - `--cpu=<cpu_limit>`: Specify the CPU limit for each node
   - `--memory=<memory_limit>`: Specify the memory limit for each node
   - `--port=<port_number>`: Specify the port number for the cluster
   - `--database`: whether to include a database in the cluster
   - `--module=<module_name>`: which module manager to use (default is `Lmod`) available options are `lmod` and `em` (Environment Modules)
- `tac destroy <cluster_name>`: Destroy a specific cluster
- `tac destroy:all`: Destroy all clusters
- `tac cluster list`: List all available clusters
- `tac cluster start <cluster_name>`: Start a specific cluster
- `tac cluster stop <cluster_name>`: Stop a specific cluster
