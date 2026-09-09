import { Args, Command, Flags, ux } from '@oclif/core';

import Cluster from '../../assets/lib/cluster.js';
import { dockerUp } from '../../assets/lib/util.js';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster', required: true })
   };

   static override readonly description = 'Destroys a specific docker cluster';

   static override readonly flags = {
      preserve: Flags.boolean({
         char: 'p',
         default: false,
         description: 'Preserve cluster files so it can be booted again'
      })
   };

   public async run(): Promise<void> {
      const { args, flags } = await this.parse(DestroyIndex);

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

      // Check that the cluster exits
      if (!cluster.exists()) {
         throw new Error(ux.colorize('yellow', `${cluster.name} isn't a cluster that exists`));
      }

      // Destroy and delete cluster
      ux.action.start(`Destroying ${cluster.name}${flags.preserve ? '' : " and it's files"}`);
      if (await cluster.destroy(flags.preserve)) {
         ux.action.stop(ux.colorize('green', 'Successful'));
         console.log(`\nSuccessfully destroyed ${cluster.name}\n`);
      } else {
         ux.action.stop(ux.colorize('red', 'Failed'));
         throw new Error(`\nFailed to destroy ${cluster.name}\n`);
      }
   }
}
