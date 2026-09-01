import { Command } from '@oclif/core';
import chalk from 'chalk';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import ora from 'ora';

import Cluster from '../../assets/lib/cluster';
import { pathToCluster } from '../../assets/lib/paths';
import { dockerUp } from '../../assets/lib/util';

export default class DestroyAll extends Command {
   static override readonly description =
      'Destroys all the docker clusters that have been created using the tool';

   public async run(): Promise<void> {
      // Check whether docker is running
      if (!(await dockerUp())) {
         return console.log(chalk.red('\nDocker needs to be running\n'));
      }

      // Get the path to the cluster folder
      const clustersDir = pathToCluster('');

      // Check to see if the cluster dir exists
      if (!existsSync(clustersDir)) {
         return console.log(`\nNo clusters exists\n`);
      }

      console.log();
      const spinner = ora(`Removing clusters`).start();

      // Read the clusters dir and filter out non folders
      const clusters = readdirSync(clustersDir)
         .map((cluster) => join(clustersDir, cluster))
         .filter((cluster) => statSync(cluster).isDirectory())
         .map((cluster) => basename(cluster));

      // Handle deleting the containers and removing their files
      await Promise.all(
         clusters.map(async (name) => {
            await new Cluster(name).destroy();
         })
      ).then(() => {
         spinner.succeed('Successfully removed all clusters');
         console.log(
            chalk.green(
               `\nRemoved ${clusters.length} ${clusters.length > 1 ? 'clusters' : 'cluster'}.\n`
            )
         );
      });
   }
}
