import { Args, Command, Flags, ux } from '@oclif/core';

import Cluster, { ClusterOptions } from '../../assets/lib/cluster';

export default class ClusterEdit extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster to edit', required: true })
   };
   static override readonly description = 'Edits the info for a cluster';
   static override readonly flags = {
      cpus: Flags.integer({
         char: 'c',
         description: 'How many CPUs to give each node',
         min: 1
      }),
      database: Flags.boolean({
         char: 'd',
         description: 'Whether or not a database should be setup for the cluster'
      }),
      memory: Flags.integer({
         char: 'm',
         description: 'How much memory will be given to the cluster',
         min: 1024
      }),
      module: Flags.string({
         char: 'l',
         description: 'The module loader type to use in the cluster'
      }),
      nodes: Flags.integer({
         char: 'k',
         description: 'How many nodes to give to the cluster',
         min: 1
      }),
      port: Flags.integer({
         char: 'p',
         description: 'Which port to use for the SSH',
         max: 2300,
         min: 2200
      })
   };

   public async run(): Promise<void> {
      const { args, flags } = await this.parse(ClusterEdit);

      // Get cluster
      const cluster = new Cluster(args.name);

      // Check that cluster exists
      if (!cluster.exists()) {
         return console.log(
            ux.colorize('red', "\nThe cluster you're trying to edit doesn't exists.\n")
         );
      }

      // Get cluster information
      const clusterData: ClusterOptions | null = cluster.dumpInfo();

      // Make sure there is cluster information
      if (!clusterData) {
         return console.log(ux.colorize('red', '\nFailed to retrieve cluster information.\n'));
      }

      // merge new data with old
      const updates = Object.fromEntries(
         Object.entries(flags).filter(([, value]) => value !== undefined)
      ) as Partial<Omit<ClusterOptions, 'name'>>;

      // Merge the options
      const updatedCluster: ClusterOptions = {
         ...clusterData,
         ...updates
      };

      // destroy old cluster if data changed
      const changed = (Object.keys(clusterData) as Array<keyof ClusterOptions>).some(
         (key) => clusterData[key] !== updatedCluster[key]
      );

      // Make sure there is ta least one change
      if (!changed) {
         return console.log(
            ux.colorize('yellow', '\nNo changes were made so cancelling update.\n')
         );
      }

      // Create spinner
      console.log();
      ux.action.start('Clearing old cluster information');

      // Destroys the cluster
      if (await cluster.destroy()) {
         ux.action.stop(ux.colorize('green', 'Successful'));
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
         return;
      }

      // Create updated cluster
      ux.action.start('Updating cluster with new options');
      if (cluster.create(updatedCluster)) {
         ux.action.stop(ux.colorize('green', 'Successful'));
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
      }
   }
}
