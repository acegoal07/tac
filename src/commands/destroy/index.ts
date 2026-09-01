import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';

import Cluster from '../../assets/lib/cluster';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The docker cluster to destroy', required: true })
   };
   static override readonly description = 'Destroys a specific docker cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(DestroyIndex);

      // Get cluster
      const cluster = new Cluster(args.name);

      // Check that the cluster exits
      if (!cluster.exists()) {
         return console.log(chalk.yellow(`\n${cluster.name} isn't a cluster that exists.\n`));
      }

      // Create spinner
      console.log();
      const spinner = ora(`Destroying cluster and it's files`).start();

      // Destroy and delete cluster
      const outcome = await cluster.destroy();

      // Update spinner with the outcome
      if (outcome) {
         spinner.succeed('Successfully destroyed the cluster');
      } else {
         spinner.fail('Failed to destroyed the cluster');
      }

      console.log();
   }
}
