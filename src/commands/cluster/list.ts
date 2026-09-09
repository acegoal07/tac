import { Command, ux } from '@oclif/core';
import Table from 'cli-table3';
import { existsSync, readdirSync } from 'node:fs';

import Cluster from '../../assets/lib/cluster.js';
import { pathToCluster } from '../../assets/lib/paths.js';

export default class ClusterList extends Command {
   static override readonly description = 'Lists all the clusters';

   public async run(): Promise<void> {
      // Cluster dir path
      const clustersDir = pathToCluster();

      // Check that the dir exists
      if (!existsSync(clustersDir)) {
         console.log(ux.colorize('green', '\nNo clusters exist\n'));
         return;
      }

      // Show a spinner while information it's collected
      console.log();
      ux.action.start('Collecting cluster information');

      // Read the clusters dir and filter out non folders
      const clusterNames = readdirSync(clustersDir, { withFileTypes: true })
         .filter((entry) => entry.isDirectory())
         .map((entry) => entry.name);

      // Makes sure there is at least one cluster
      if (clusterNames.length === 0) {
         ux.action.stop(ux.colorize('green', 'Successful'));
         console.log(ux.colorize('green', '\nNo clusters exist\n'));
         return;
      }

      // Create table layout
      const table = new Table({
         head: [
            ux.colorize('cyan', 'Name'),
            ux.colorize('cyan', 'Up'),
            ux.colorize('cyan', 'Module'),
            ux.colorize('cyan', 'Port'),
            ux.colorize('cyan', 'CPUs'),
            ux.colorize('cyan', 'Memory'),
            ux.colorize('cyan', 'Nodes'),
            ux.colorize('cyan', 'Database')
         ]
      });

      // Add information to table
      const rows = await Promise.all(
         clusterNames.map(async (name) => {
            const cluster = new Cluster(name);

            // Make sure cluster exists
            if (!cluster.exists()) {
               return;
            }

            // Get cluster information
            const clusterInfo = cluster.dumpInfo();

            // Make sure there is cluster information
            if (!clusterInfo) {
               return;
            }

            // Add it to the table
            return [
               cluster.name,
               (await cluster.isUp()) ? ux.colorize('green', 'Yes') : ux.colorize('red', 'No'),
               clusterInfo.module,
               clusterInfo.port,
               clusterInfo.cpus,
               clusterInfo.memory,
               clusterInfo.nodes,
               clusterInfo.database ? 'Yes' : 'No'
            ];
         })
      );

      // Add rows to table
      table.push(...rows.filter((row): row is Array<number | string> => row !== undefined));

      // Visualise the information
      ux.action.stop(ux.colorize('green', 'Successful'));
      console.log(`\n${table.toString()}\n`);
   }
}
