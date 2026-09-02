import { Command, Flags, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster';

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
         return console.log(`\nA cluster with that name already exists try again.\n`);
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
         ux.action.stop('successful');

         // File location
         console.log(
            ux.colorize(
               'green',
               `\nThe ${cluster.name} cluster has been saved to:\n${cluster.path}`
            )
         );

         // Show how to start it up
         console.log(
            ux.colorize(
               'green',
               `\nYou can now start up the cluster using:\ntac cluster:start ${flags.name}\n`
            )
         );
      } else {
         ux.action.stop('Failed');
         console.log(ux.colorize('red', '\nFailed to create a cluster\n'));
      }
   }
}
