import { Command } from '@oclif/core';
import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { pathToCluster } from '../../assets/lib/paths';

export default class ClusterList extends Command {
   static override readonly description = 'describe the command here';

   public async run(): Promise<void> {
      // Cluster dir path
      const clustersDir = pathToCluster('');

      // Check that the dir exists
      if (!existsSync(clustersDir)) {
         return console.log(`\nNo cluster exist\n`);
      }

      // Read the clusters dir and filter out non folders
      const clusters = readdirSync(clustersDir)
         .map((cluster) => join(clustersDir, cluster))
         .filter((cluster) => statSync(cluster).isDirectory());

      // Makes sure there is at least one cluster
      if (clusters.length === 0) {
         return console.log(chalk.bold.green(`\nNo available clusters\n`));
      }

      // Display all clusters paths
      console.log(chalk.bold.green(`\nAvailable clusters:\n`));
      for (const cluster of clusters) {
         const portFile = join(cluster, 'port');
         console.log(
            `${cluster.split('/').at(-1)}:${existsSync(portFile) ? Number(readFileSync(portFile)) : 2200}`
         );
      }

      console.log();
   }
}
