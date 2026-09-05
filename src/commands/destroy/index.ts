import { Args, Command, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster';
import { dockerUp } from '../../assets/lib/util';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster', required: true })
   };
   static override readonly description = 'Destroys a specific docker cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(DestroyIndex);

      // Check whether docker is running
      if (!(await dockerUp())) {
         return console.log(ux.colorize('red', '\nDocker needs to be running\n'));
      }

      // Get cluster
      const cluster = new Cluster(args.name);

      // Check that the cluster exits
      if (!cluster.exists()) {
         return console.log(
            ux.colorize('yellow', `\n${cluster.name} isn't a cluster that exists.\n`)
         );
      }

      // Create spinner
      console.log();
      ux.action.start(`Destroying ${cluster.name} and it's files`);

      // Destroy and delete cluster
      if (await cluster.destroy()) {
         ux.action.stop(ux.colorize('green', 'Successful'));
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
      }

      console.log();
   }
}
