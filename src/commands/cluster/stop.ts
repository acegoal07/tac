import { Args, Command } from '@oclif/core';
import { stop } from 'docker-compose';
import { existsSync } from 'node:fs';
import ora from 'ora';

import { pathToCluster } from '../../assets/lib/paths';

export default class ClusterStop extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster you want to stop', required: true })
   };
   static override readonly description = 'Stops a cluster you have running';

   public async run(): Promise<void> {
      const { args } = await this.parse(ClusterStop);

      // Path to cluster
      const clusterPath = pathToCluster(args.name);

      // Check that a cluster exists
      if (!existsSync(clusterPath)) {
         return console.log('No cluster exists with that name');
      }

      // Stop the cluster
      const spinner = ora('Stopping the cluster').start();

      await stop({ cwd: clusterPath })
         .catch((error) => {
            spinner.fail('Failed to stop cluster');
            return console.error(
               `\nAn error occurred while initialising the cluster, ERROR:\n ${error}\n`
            );
         })
         .then(() => {
            spinner.succeed('Cluster has been stopped');
         });
   }
}
