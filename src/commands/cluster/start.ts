import { Args, Command, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster.js';
import { dockerUp } from '../../assets/lib/util.js';

export default class ClusterStart extends Command {
   static override readonly args = {
      name: Args.string({
         description: 'The name of the cluster',
         required: true
      })
   };

   static override readonly description = 'Starts up the cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(ClusterStart);

      // Check whether docker is running
      if (!(await dockerUp())) {
         console.log(ux.colorize('red', '\nDocker needs to be running\n'));
         return;
      }

      // Get the cluster
      const cluster = new Cluster(args.name);

      // Check that a cluster exists
      if (!cluster.exists()) {
         console.log(ux.colorize('yellow', '\nNo cluster exists with that name\n'));
         return;
      }

      // Check if anything within the cluster is running
      if (await cluster.isUp()) {
         console.log(ux.colorize('red', '\nThe cluster is already running\n'));
         return;
      }

      // Start up container
      console.log(
         ux.colorize(
            'yellow',
            '\nIf this is your first time starting the cluster\nit can take a while to create the image so be patient\n'
         )
      );

      // Start cluster
      ux.action.start(`Starting ${cluster.name}`);
      await cluster
         .start()
         .then(async () => {
            ux.action.stop(ux.colorize('green', 'Successful'));
            console.log(
               ux.colorize(
                  'green',
                  `\n${args.name} has been started and can now be connect to using:\ntac connect ${args.name}\n`
               )
            );
            console.log(
               ux.colorize(
                  'yellow',
                  'Some nodes might still be starting so might not be accessible straight away\n'
               )
            );
         })
         .catch((error: unknown) => {
            ux.action.stop(ux.colorize('red', 'Failed'));
            console.error(ux.colorize('red', '\nAn error occurred while starting the cluster\n'));

            throw error;
         });
   }
}
