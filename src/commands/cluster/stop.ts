import { Args, Command, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster.js';
import { dockerUp } from '../../assets/lib/util.js';

export default class ClusterStop extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster', required: true })
   };

   static override readonly description = 'Stops a cluster you have running';

   public async run(): Promise<void> {
      const { args } = await this.parse(ClusterStop);

      // Check whether docker is running
      console.log();
      ux.action.start('Checking docker');

      if (!(await dockerUp())) {
         ux.action.stop(ux.colorize('red', 'Down'));
         throw new Error(ux.colorize('red', 'Docker needs to be running'));
      }

      ux.action.stop(ux.colorize('green', 'Running'));

      // Get the cluster
      ux.action.start('Checking cluster');
      const cluster = new Cluster(args.name);

      // Check that a cluster exists
      if (!cluster.exists()) {
         ux.action.stop(ux.colorize('yellow', 'Not Found'));
         throw new Error(ux.colorize('yellow', 'No cluster exists with that name'));
      }

      // Check if anything within the cluster is running
      if (!(await cluster.isUp())) {
         ux.action.stop(ux.colorize('red', 'Not Running'));
         throw new Error(ux.colorize('red', "The cluster isn't running"));
      }

      ux.action.stop(ux.colorize('green', 'Complete'));

      // Stop the cluster
      ux.action.start(`Stopping ${cluster.name}`);
      await cluster
         .stop()
         .then(() => {
            ux.action.stop(ux.colorize('green', 'Successful'));
            console.log(ux.colorize('green', `\n${cluster.name} has been stopped\n`));
         })
         .catch((error: unknown) => {
            ux.action.stop(ux.colorize('red', 'Failed'));
            console.error(
               ux.colorize('red', '\nAn error occurred while initialising the cluster\n')
            );
            throw error;
         });
   }
}
