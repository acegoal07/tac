import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { down } from 'docker-compose';
import { existsSync, rmSync } from 'node:fs';
import ora from 'ora';

import { pathToCluster } from '../../assets/lib/paths';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The docker cluster to destroy', required: true })
   };
   static override readonly description = 'Destroys a specific docker cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(DestroyIndex);
      const clusterPath = pathToCluster(args.name);

      // Check if the cluster exists
      if (!existsSync(clusterPath)) {
         return console.log(`No cluster exists with that name`);
      }

      console.log();
      const spinner = ora('Removing cluster').start();

      // Handle deleting the container and removing it's files
      await down({
         commandOptions: ['--volumes'],
         cwd: clusterPath
      })
         .then(() => {
            rmSync(clusterPath, {
               force: true,
               recursive: true
            });
         })
         .then(() => {
            spinner.succeed('Cluster removed');
            console.log(chalk.green(`\nRemoved the cluster ${args.name}.\n`));
         });
   }
}
