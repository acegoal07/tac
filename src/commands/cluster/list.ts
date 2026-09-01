import { Command } from '@oclif/core';
import chalk from 'chalk';
import Table from 'cli-table3';
import { existsSync, readdirSync } from 'node:fs';

import Cluster from '../../assets/lib/cluster';
import { pathToCluster } from '../../assets/lib/paths';

export default class ClusterList extends Command {
   static override readonly description = 'Lists all the clusters';

   public async run(): Promise<void> {
      // Cluster dir path
      const clustersDir = pathToCluster('');

      // Check that the dir exists
      if (!existsSync(clustersDir)) {
         return console.log(`\nNo cluster exist\n`);
      }

      // Read the clusters dir and filter out non folders
      const clusterNames = readdirSync(clustersDir, { withFileTypes: true })
         .filter((entry) => entry.isDirectory())
         .map((entry) => entry.name);

      // Makes sure there is at least one cluster
      if (clusterNames.length === 0) {
         return console.log(chalk.bold.green(`\nNo available clusters\n`));
      }

      const table = new Table({
         colWidths: [20, 15, 10, 8, 12, 8, 12],
         head: [
            chalk.bold.cyan('Name'),
            chalk.bold.cyan('Module'),
            chalk.bold.cyan('Port'),
            chalk.bold.cyan('CPUs'),
            chalk.bold.cyan('Memory'),
            chalk.bold.cyan('Nodes'),
            chalk.bold.cyan('Database')
         ]
      });

      for (const name of clusterNames) {
         const cluster = new Cluster(name);

         // Make sure cluster exists
         if (!cluster.exists()) {
            continue;
         }

         // Get cluster information
         const clusterInfo = cluster.dumpInfo();

         // Make sure there is cluster information
         if (!clusterInfo) {
            continue;
         }

         // Add it to the table
         table.push([
            cluster.name,
            clusterInfo.module,
            clusterInfo.port,
            clusterInfo.cpus,
            clusterInfo.memory,
            clusterInfo.nodes,
            clusterInfo.database ? 'Yes' : 'No'
         ]);
      }

      console.log(`\n${table.toString()}\n`);
   }
}
