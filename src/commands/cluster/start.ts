import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { ps, upAll } from 'docker-compose';
import Docker from 'dockerode';
import { existsSync } from 'node:fs';
import ora from 'ora';

import { pathToCluster } from '../../assets/lib/paths';

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
         return console.log('\nNo cluster exists with that name\n');
      }

      // service information
      const clusterInformation = await ps({ cwd: clusterPath });

      // Check if anything within the cluster is running
      if (
         !clusterInformation.data.services.every((service) => service.state.toLowerCase() === 'up')
      ) {
         return console.log(chalk.red(`\nThe cluster is already running\n`));
      }

      // Start up container
      console.log(
         chalk.yellow(
            '\nIf this is your first time booting a cluster\nit can take a while to create the image so be patient\n'
         )
      );

      const spinner = ora('Initialising cluster').start();

      await upAll({ cwd: clusterPath })
         .catch((error) => {
            spinner.fail('Failed to initialise cluster');
            return console.error(
               `\nAn error occurred while initialising the cluster, ERROR:\n${error}\n`
            );
         })
         .then(() => {
            spinner.succeed('Successfully initialised cluster');
            console.log(
               chalk.green(
                  `\n${args.name} has been started and can now be connect to using:\ntac connect ${args.name}\n`
               )
            );
         });
   }
}
