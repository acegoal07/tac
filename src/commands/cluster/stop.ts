import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { stop } from 'docker-compose';
import ora from 'ora';

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
         return console.log(chalk.red('\nDocker needs to be running\n'));
      }

      // Get the cluster
      const cluster = new Cluster(args.name);

      // Check that a cluster exists
      if (!cluster.exists()) {
         return console.log(chalk.yellow('\nNo cluster exists with that name\n'));
      }

      // Check if anything within the cluster is running
      if (!(await cluster.isUp())) {
         return console.log(chalk.red(`\nThe cluster isn't running\n`));
      }

      // Stop the cluster
      console.log();
      const spinner = ora('Stopping the cluster').start();

      await stop({ cwd: cluster.path })
         .catch((error) => {
            spinner.fail('Failed to stop cluster');
            return console.error(
               `\nAn error occurred while initialising the cluster, ERROR:\n ${error}\n`
            );
         })
         .then(() => {
            spinner.succeed('Cluster has been stopped');
            console.log(chalk.green(`\n${args.name} has been stopped\n`));
         });
   }
}
