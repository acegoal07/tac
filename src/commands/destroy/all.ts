import { Command } from '@oclif/core';
import { downMany } from 'docker-compose';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export default class DestroyAll extends Command {
   static override readonly description =
      'Destroys all the docker clusters that have been created using the tool';

   public async run(): Promise<void> {
      const clustersDir = join(__dirname, '..', '..', 'clusters');

      if (!existsSync(clustersDir)) {
         return console.log(`No clusters exists`);
      }

      const clusters = readdirSync(clustersDir).map((cluster) => join(clustersDir, cluster));

      await downMany(clusters);

      for (const cluster of clusters) {
         rmSync(cluster, {
            force: true,
            recursive: true
         });
      }

      console.log('Removed all clusters.');
   }
}
