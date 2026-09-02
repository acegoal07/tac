import { Args, Command, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster';
import { dockerUp } from '../../assets/lib/util';

export default class ClusterStop extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster you want to stop', required: true })
   };
   static override readonly description = 'Stops a cluster you have running';

   public async run(): Promise<void> {
      const { args } = await this.parse(ClusterStop);

      // Check whether docker is running
      if (!(await dockerUp())) {
         return console.log(ux.colorize('red', '\nDocker needs to be running\n'));
      }

      // Get the cluster
      const cluster = new Cluster(args.name);

      // Check that a cluster exists
      if (!cluster.exists()) {
         return console.log(ux.colorize('yellow', '\nNo cluster exists with that name\n'));
      }

      // Check if anything within the cluster is running
      if (!(await cluster.isUp())) {
         return console.log(ux.colorize('red', "\nThe cluster isn't running\n"));
      }

      // Stop the cluster
      console.log();
      ux.action.start('Stopping the cluster');

      await cluster
         .stop()
         .catch((error) => {
            ux.action.stop('Failed');
            console.error(
               ux.colorize('red', '\nAn error occurred while initialising the cluster, ERROR:\n')
            );
            return console.log(error);
         })
         .then(() => {
            ux.action.stop('Successful');
            console.log(ux.colorize('green', `\n${args.name} has been stopped\n`));
         });
   }
}
