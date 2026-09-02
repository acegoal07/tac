import { Args, Command, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster';
import { dockerUp, sshdRunning } from '../../assets/lib/util';

export default class ClusterStart extends Command {
   static override readonly args = {
      name: Args.string({
         description: 'The name of the cluster you want to start',
         required: true
      })
   };
   static override readonly description = 'Starts up the cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(ClusterStart);

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
      if (await cluster.isUp()) {
         return console.log(ux.colorize('red', '\nThe cluster is already running\n`'));
      }

      // Start up container
      console.log(
         ux.colorize(
            'yellow',
            '\nIf this is your first time booting a cluster\nit can take a while to create the image so be patient\n'
         )
      );

      // Start cluster
      ux.action.start('Booting cluster');
      await cluster
         .start()
         .then(async () => {
            ux.action.stop(ux.colorize('green', 'Successful'));
            ux.action.start('Running initialiser scripts');
            const running = await sshdRunning(args.name);
            if (running) {
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
                     'Some nodes might still be booting still so might not be accessible straight away\n'
                  )
               );
            } else {
               ux.action.stop(ux.colorize('red', 'Timed out'));
               console.log(
                  ux.colorize(
                     'yellow',
                     `\n${args.name} is taking a while to start the SSH daemon\nWait a few minutes and then try connecting using: \ntac connect ${args.name}\n`
                  )
               );
            }
         })
         .catch((error) => {
            ux.action.stop(ux.colorize('red', 'Failed'));
            console.error(
               ux.colorize('red', '\nAn error occurred while booting the cluster, ERROR:\n')
            );
            return console.log(error);
         });
   }
}
