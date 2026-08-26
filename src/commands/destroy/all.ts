import { Command } from '@oclif/core';
import chalk from 'chalk';
import { down } from 'docker-compose';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ora from 'ora';

import { pathToCluster } from '../../assets/lib/paths';

export default class DestroyAll extends Command {
   static override readonly description =
      'Destroys all the docker clusters that have been created using the tool';

   public async run(): Promise<void> {
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
         .filter((cluster) => statSync(cluster).isDirectory());

      // Handle deleting the containers and removing their files
      await Promise.all(
         clusters.map(async (cluster) => {
            await down({
               commandOptions: ['--volumes'],
               cwd: cluster
            });

            rmSync(cluster, {
               force: true,
               recursive: true
            });
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
