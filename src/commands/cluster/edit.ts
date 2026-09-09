import { Args, Command, Flags, ux } from '@oclif/core';

import Cluster, { type ClusterOptions } from '../../assets/lib/cluster.js';
import { dockerUp } from '../../assets/lib/util.js';

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

      // Check whether docker is running
      console.log();
      ux.action.start('Checking docker');

      if (!(await dockerUp())) {
         ux.action.stop(ux.colorize('red', 'Down'));
         throw new Error(ux.colorize('red', 'Docker needs to be running'));
      }

      ux.action.stop(ux.colorize('green', 'Running'));

      // Get cluster
      const cluster = new Cluster(args.name);

      // Check that cluster exists
      if (!cluster.exists()) {
         throw new Error(ux.colorize('red', "The cluster you're trying to edit doesn't exists"));
      }

      // Get cluster information
      const clusterData: ClusterOptions | undefined = cluster.dumpInfo();

      // Make sure there is cluster information
      if (!clusterData) {
         throw new Error(ux.colorize('red', 'Failed to retrieve cluster information'));
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
      const isChanged = (Object.keys(clusterData) as Array<keyof ClusterOptions>).some(
         (key) => clusterData[key] !== updatedCluster[key]
      );

      // Make sure there is ta least one change
      if (!isChanged) {
         throw new Error(ux.colorize('yellow', 'No changes were made'));
      }

      // Destroys the cluster
      ux.action.start('Clearing old cluster information');
      if (await cluster.destroy()) {
         ux.action.stop(ux.colorize('green', 'Successful'));
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
         throw new Error(ux.colorize('red', 'Failed to clear old cluster information'));
      }

      // Create updated cluster
      ux.action.start('Updating cluster with new options');
      if (cluster.create(updatedCluster)) {
         ux.action.stop(ux.colorize('green', 'Successful'));
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
         throw new Error(ux.colorize('red', 'Failed to update cluster with new options'));
      }
   }
}
