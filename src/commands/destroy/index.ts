import { Args, Command } from '@oclif/core';
import { down } from 'docker-compose';
import { existsSync, rmSync } from 'node:fs';

import { pathToCluster } from '../../assets/lib/paths';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The docker cluster to destroy', required: true })
   };
   static override readonly description = 'Destroys a specific docker cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(DestroyIndex);
      const clusterDir = pathToCluster(args.name);

      if (!existsSync(clusterDir)) {
         return console.log(`No cluster exists with that name`);
      }

      await down({
         commandOptions: ['--volumes'],
         cwd: clusterDir
      })
         .then(() => {
            rmSync(clusterDir, {
               force: true,
               recursive: true
            });
         })
         .then(() => {
            console.log(`Removed the cluster ${args.name}.`);
         });
   }
}
