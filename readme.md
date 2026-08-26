# tac - Technically A Cluster 

tac is a CLI tool that allows users to create test clusters using docker. It offers the ability to customise the clusters, manage the created clusters, and access them all from within the CLI.

## How to install:
```sh
sudo npm i -g @acegoal07/tac
```

## Available commands:
- `tac help`: Display help information
- `tac connect`: Connect to an existing cluster
- `tac create`: Create a new cluster
- `tac destroy`: Destroy a specific cluster
- `tac destroy:all`: Destroy all clusters
- `tac cluster list`: List all available clusters
- `tac cluster start`: Start a specific cluster
- `tac cluster stop`: Stop a specific cluster
