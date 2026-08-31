import chalk from 'chalk';
import { down } from 'docker-compose';
import { existsSync, rmSync } from 'node:fs';
import ora from 'ora';

import { pathToCluster } from './paths';

export default async function destroyCluster(name: string) {
   const clusterPath = pathToCluster(name);

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
         console.log(chalk.green(`\nRemoved the cluster ${name}.\n`));
      });
}
