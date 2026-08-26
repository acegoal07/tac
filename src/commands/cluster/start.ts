import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { upAll } from 'docker-compose';
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

      // Path to cluster
      const clusterPath = pathToCluster(args.name);

      // Check that a cluster exists
      if (!existsSync(clusterPath)) {
         return console.log('\nNo cluster exists with that name\n');
      }

      // Start up container
      console.log(
         chalk.yellow(
            '\nIf this is your first time booting a cluster\nit can take a while to create the image so be patient\n'
         )
      );

      const spinner = ora('Initialising cluster');

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
