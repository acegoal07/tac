import { Command, ux } from '@oclif/core';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import Cluster from '../../assets/lib/cluster.js';
import { pathToCluster } from '../../assets/lib/paths.js';
import { dockerUp } from '../../assets/lib/util.js';

export default class DestroyAll extends Command {
   static override readonly description =
      'Destroys all the docker clusters that have been created using the tool';

   public async run(): Promise<void> {
      // Check whether docker is running
      if (!(await dockerUp())) {
         console.log(ux.colorize('red', '\nDocker needs to be running\n'));
         return;
      }

      // Get the path to the cluster folder
      const clustersDir = pathToCluster();

      // Check to see if the cluster dir exists
      if (!existsSync(clustersDir)) {
         console.log(ux.colorize('yellow', '\nNo clusters exists\n'));
         return;
      }

      console.log();
      ux.action.start('Removing clusters');

      // Read the clusters dir and filter out non folders
      const clusters = readdirSync(clustersDir)
         .map((cluster) => path.join(clustersDir, cluster))
         .filter((cluster) => statSync(cluster).isDirectory())
         .map((cluster) => path.basename(cluster));

      // Handle deleting the containers and removing their files
      await Promise.all(
         clusters.map(async (name) => {
            await new Cluster(name).destroy();
         })
      ).then(() => {
         ux.action.stop(ux.colorize('green', 'Successful'));
         console.log(
            ux.colorize(
               'green',
               `\nRemoved ${clusters.length} ${clusters.length > 1 ? 'clusters' : 'cluster'}.\n`
            )
         );
      });
   }
}
