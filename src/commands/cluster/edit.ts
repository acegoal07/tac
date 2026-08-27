import { Args, Command, Flags } from '@oclif/core';

import Cluster from '../../assets/lib/cluster';
import createCluster from '../../assets/lib/create-cluster';
import destroyCluster from '../../assets/lib/destroy-cluster';
import { clusterParams } from '../../assets/lib/types';

export default class Edit extends Command {
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
      const { args, flags } = await this.parse(Edit);
      // get cluster data
      const cluster = new Cluster(args.name);

      const clusterData: clusterParams = cluster.dump();

      // merge new data with old
      const updates = Object.fromEntries(
         Object.entries(flags).filter(([, value]) => value !== undefined)
      ) as Partial<Omit<clusterParams, 'name'>>;

      const updatedCluster: clusterParams = {
         ...clusterData,
         ...updates
      };

      // destroy old cluster if data changed
      const changed = (Object.keys(clusterData) as Array<keyof clusterParams>).some(
         (key) => clusterData[key] !== updatedCluster[key]
      );

      if (!changed) {
         console.log('Data has not changed. Nothing to do.\nExiting...');
         return;
      }

      await destroyCluster(args.name);

      // create new cluster
      createCluster(updatedCluster, cluster.path);
   }
}
