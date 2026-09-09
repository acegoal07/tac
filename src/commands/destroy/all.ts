import { Command, Flags, ux } from '@oclif/core';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import Cluster from '../../assets/lib/cluster.js';
import { pathToCluster } from '../../assets/lib/paths.js';
import { dockerUp } from '../../assets/lib/util.js';

export default class DestroyAll extends Command {
   static override readonly description =
      'Destroys all the docker clusters that have been created using the tool';

   static override readonly flags = {
      preserve: Flags.boolean({
         char: 'p',
         default: false,
         description: 'Preserve cluster files so it can be booted again'
      })
   };

   public async run(): Promise<void> {
      const { flags } = await this.parse(DestroyAll);

      // Check whether docker is running
      console.log();
      ux.action.start('Checking docker');

      if (!(await dockerUp())) {
         ux.action.stop(ux.colorize('red', 'Down'));
         throw new Error(ux.colorize('red', 'Docker needs to be running'));
      }

      ux.action.stop(ux.colorize('green', 'Running'));

      // Get the path to the cluster folder
      const clustersDir = pathToCluster();

      // Check to see if the cluster dir exists
      if (!existsSync(clustersDir)) {
         throw new Error(ux.colorize('yellow', 'No clusters exists'));
      }

      // Read the clusters dir and filter out non folders
      const clusters = readdirSync(clustersDir)
         .map((cluster) => path.join(clustersDir, cluster))
         .filter((cluster) => statSync(cluster).isDirectory())
         .map((cluster) => path.basename(cluster));

      // Handle deleting the containers and removing their files
      ux.action.start('Removing clusters');
      await Promise.all(
         clusters.map(async (name) => {
            await new Cluster(name).destroy(flags.preserve);
         })
      ).then(() => {
         ux.action.stop(ux.colorize('green', 'Successful'));
         console.log(
            ux.colorize(
               'green',
               `\nRemoved ${clusters.length} ${clusters.length > 1 ? 'clusters' : 'cluster'}\n`
            )
         );
      });
   }
}
