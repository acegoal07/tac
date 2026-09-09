import { Command, Flags, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster.js';

export default class ClusterCreate extends Command {
   static override readonly description = 'Creates a clusters files using the options provided';
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
      const { flags } = await this.parse(ClusterCreate);

      // Get cluster
      const cluster = new Cluster(flags.name);

      // Check if the cluster already exists
      if (cluster.exists()) {
         throw new Error(ux.colorize('red', 'A cluster with that name already exists'));
      }

      // Create spinner
      console.log();
      ux.action.start('Creating cluster');

      // Create cluster
      if (
         cluster.create({
            cpus: flags.cpus,
            database: flags.database,
            memory: flags.memory,
            module: flags.module,
            name: flags.name,
            nodes: flags.nodes,
            port: flags.port
         })
      ) {
         // Success spinner
         ux.action.stop(ux.colorize('green', 'successful'));

         // Show cluster information
         console.log(
            ux.colorize(
               'green',
               `\nThe ${cluster.name} cluster has been saved to:\n${cluster.path}\n\nYou can now start up the cluster using:\ntac cluster:start ${cluster.name}\n`
            )
         );
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
         throw new Error(ux.colorize('red', 'Failed to create a cluster'));
      }
   }
}
