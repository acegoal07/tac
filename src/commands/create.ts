import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';

import createCluster from '../assets/lib/create-cluster';
import { pathToCluster } from '../assets/lib/paths';
import { clusterParams } from '../assets/lib/types';

export default class CreateIndex extends Command {
   static override readonly description = 'describe the command here';
   static override readonly flags = {
      cpus: Flags.integer({
         char: 'c',
         default: 4,
         description: 'How many CPUs to give each node',
         min: 1
      }),
      database: Flags.boolean({
         char: 'd',
         default: false,
         description: 'Whether or not a database should be setup for the cluster'
      }),
      memory: Flags.integer({
         char: 'm',
         default: 1024,
         description: 'How much memory will be given to the cluster',
         min: 1024
      }),
      module: Flags.string({
         char: 'l',
         default: 'lmod',
         description: 'The module loader type to use in the cluster'
      }),
      name: Flags.string({
         char: 'n',
         default: 'tac',
         description: 'The name of the cluster'
      }),
      nodes: Flags.integer({
         char: 'k',
         default: 1,
         description: 'How many nodes to give to the cluster',
         min: 1
      }),
      port: Flags.integer({
         char: 'p',
         default: 2200,
         description: 'Which port to use for the SSH',
         max: 2300,
         min: 2200
      })
   };

   public async run(): Promise<void> {
      const { flags } = await this.parse(CreateIndex);

      const clusterInfo: clusterParams = {
         cpus: flags.cpus,
         database: flags.database,
         memory: flags.memory,
         module: flags.module,
         name: flags.name,
         nodes: flags.nodes,
         port: flags.port
      };

      const clusterPath = pathToCluster(clusterInfo.name);

      const created = createCluster(clusterInfo, clusterPath);

      if (created) {
         // File location
         console.log(chalk.green(`\nThe ${flags.name} cluster has been saved to:\n${clusterPath}`));

         // Show how to start it up
         console.log(
            chalk.green(
               `\nYou can now start up the cluster using:\ntac cluster:start ${flags.name}\n`
            )
         );
      } else {
         console.log(chalk.red('\nFailed to set up cluster\n'));
      }
   }
}
