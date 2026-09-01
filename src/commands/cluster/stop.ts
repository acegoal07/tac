import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { ps, stop } from 'docker-compose';
import Docker from 'dockerode';
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

      // Check whether docker is running
      const docker = new Docker();

      try {
         await docker.ping();
      } catch {
         return console.log(chalk.red('\nDocker needs to be running\n'));
      }

      // Path to cluster
      const clusterPath = pathToCluster(args.name);

      // Check that a cluster exists
      if (!existsSync(clusterPath)) {
         return console.log(chalk.yellow(`\nNo cluster exists with that name\n`));
      }

      // service information
      const clusterInformation = await ps({ cwd: clusterPath });

      // Check if anything within the cluster is running
      if (
         !clusterInformation.data.services.every((service) => service.state.toLowerCase() !== 'up')
      ) {
         return console.log(chalk.red(`\nThe cluster isn't running\n`));
      }

      // Stop the cluster
      console.log();
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
            console.log(chalk.green(`\n${args.name} has been stopped\n`));
         });
   }
}
