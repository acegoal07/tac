import { Command } from '@oclif/core';
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

      if (!existsSync(clustersDir)) {
         return console.log(`No clusters exists`);
      }

      const spinner = ora(`Removing clusters`).start();

      const clusters = readdirSync(clustersDir)
         .map((cluster) => join(clustersDir, cluster))
         .filter((cluster) => statSync(cluster).isDirectory());

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
      );

      spinner.succeed('Successfully removed clusters');

      console.log(
         `\nRemoved ${clusters.length} ${clusters.length > 1 ? 'clusters' : 'cluster'}.\n`
      );
   }
}
