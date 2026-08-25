kind-of-a-cluster
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/kind-of-a-cluster.svg)](https://npmjs.org/package/kind-of-a-cluster)
[![Downloads/week](https://img.shields.io/npm/dw/kind-of-a-cluster.svg)](https://npmjs.org/package/kind-of-a-cluster)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g kind-of-a-cluster
$ kind-of-a-cluster COMMAND
running command...
$ kind-of-a-cluster (--version)
kind-of-a-cluster/0.0.0 darwin-arm64 node-v26.7.0
$ kind-of-a-cluster --help [COMMAND]
USAGE
  $ kind-of-a-cluster COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`kind-of-a-cluster create [FILE]`](#kind-of-a-cluster-create-file)
* [`kind-of-a-cluster destroy NAME`](#kind-of-a-cluster-destroy-name)
* [`kind-of-a-cluster destroy all`](#kind-of-a-cluster-destroy-all)
* [`kind-of-a-cluster help [COMMAND]`](#kind-of-a-cluster-help-command)
* [`kind-of-a-cluster plugins`](#kind-of-a-cluster-plugins)
* [`kind-of-a-cluster plugins add PLUGIN`](#kind-of-a-cluster-plugins-add-plugin)
* [`kind-of-a-cluster plugins:inspect PLUGIN...`](#kind-of-a-cluster-pluginsinspect-plugin)
* [`kind-of-a-cluster plugins install PLUGIN`](#kind-of-a-cluster-plugins-install-plugin)
* [`kind-of-a-cluster plugins link PATH`](#kind-of-a-cluster-plugins-link-path)
* [`kind-of-a-cluster plugins remove [PLUGIN]`](#kind-of-a-cluster-plugins-remove-plugin)
* [`kind-of-a-cluster plugins reset`](#kind-of-a-cluster-plugins-reset)
* [`kind-of-a-cluster plugins uninstall [PLUGIN]`](#kind-of-a-cluster-plugins-uninstall-plugin)
* [`kind-of-a-cluster plugins unlink [PLUGIN]`](#kind-of-a-cluster-plugins-unlink-plugin)
* [`kind-of-a-cluster plugins update`](#kind-of-a-cluster-plugins-update)

## `kind-of-a-cluster create [FILE]`

describe the command here

```
USAGE
  $ kind-of-a-cluster create [FILE] [-f] [-n <value>]

ARGUMENTS
  [FILE]  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ kind-of-a-cluster create
```

_See code: [src/commands/create/index.ts](https://github.com/Kind-of-a-Cluster-V2/kind-of-a-cluster/blob/v0.0.0/src/commands/create/index.ts)_

## `kind-of-a-cluster destroy NAME`

Destroys a specific docker cluster

```
USAGE
  $ kind-of-a-cluster destroy NAME

ARGUMENTS
  NAME  The docker cluster to destroy

DESCRIPTION
  Destroys a specific docker cluster
```

_See code: [src/commands/destroy/index.ts](https://github.com/Kind-of-a-Cluster-V2/kind-of-a-cluster/blob/v0.0.0/src/commands/destroy/index.ts)_

## `kind-of-a-cluster destroy all`

Destroys all the docker clusters that have been created using the tool

```
USAGE
  $ kind-of-a-cluster destroy all

DESCRIPTION
  Destroys all the docker clusters that have been created using the tool
```

_See code: [src/commands/destroy/all.ts](https://github.com/Kind-of-a-Cluster-V2/kind-of-a-cluster/blob/v0.0.0/src/commands/destroy/all.ts)_

## `kind-of-a-cluster help [COMMAND]`

Display help for kind-of-a-cluster.

```
USAGE
  $ kind-of-a-cluster help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for kind-of-a-cluster.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.3.0/src/commands/help.ts)_

## `kind-of-a-cluster plugins`

List installed plugins.

```
USAGE
  $ kind-of-a-cluster plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ kind-of-a-cluster plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/index.ts)_

## `kind-of-a-cluster plugins add PLUGIN`

Installs a plugin into kind-of-a-cluster.

```
USAGE
  $ kind-of-a-cluster plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into kind-of-a-cluster.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the KIND_OF_A_CLUSTER_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the KIND_OF_A_CLUSTER_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ kind-of-a-cluster plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ kind-of-a-cluster plugins add myplugin

  Install a plugin from a github url.

    $ kind-of-a-cluster plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ kind-of-a-cluster plugins add someuser/someplugin
```

## `kind-of-a-cluster plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ kind-of-a-cluster plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ kind-of-a-cluster plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/inspect.ts)_

## `kind-of-a-cluster plugins install PLUGIN`

Installs a plugin into kind-of-a-cluster.

```
USAGE
  $ kind-of-a-cluster plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into kind-of-a-cluster.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the KIND_OF_A_CLUSTER_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the KIND_OF_A_CLUSTER_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ kind-of-a-cluster plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ kind-of-a-cluster plugins install myplugin

  Install a plugin from a github url.

    $ kind-of-a-cluster plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ kind-of-a-cluster plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/install.ts)_

## `kind-of-a-cluster plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ kind-of-a-cluster plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ kind-of-a-cluster plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/link.ts)_

## `kind-of-a-cluster plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ kind-of-a-cluster plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ kind-of-a-cluster plugins unlink
  $ kind-of-a-cluster plugins remove

EXAMPLES
  $ kind-of-a-cluster plugins remove myplugin
```

## `kind-of-a-cluster plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ kind-of-a-cluster plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/reset.ts)_

## `kind-of-a-cluster plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ kind-of-a-cluster plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ kind-of-a-cluster plugins unlink
  $ kind-of-a-cluster plugins remove

EXAMPLES
  $ kind-of-a-cluster plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/uninstall.ts)_

## `kind-of-a-cluster plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ kind-of-a-cluster plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ kind-of-a-cluster plugins unlink
  $ kind-of-a-cluster plugins remove

EXAMPLES
  $ kind-of-a-cluster plugins unlink myplugin
```

## `kind-of-a-cluster plugins update`

Update installed plugins.

```
USAGE
  $ kind-of-a-cluster plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.5.1/src/commands/plugins/update.ts)_
<!-- commandsstop -->
