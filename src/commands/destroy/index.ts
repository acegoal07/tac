import { Args, Command } from '@oclif/core';
import { down } from 'docker-compose';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The docker cluster to destroy', required: true })
   };
   static override readonly description = 'Destroys a specific docker cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(DestroyIndex);
      const clusterDir = join(__dirname, '..', '..', 'clusters', args.name);

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
         .catch((error) => console.log(error));

      console.log(`Removed the cluster ${args.name}.`);
   }
}
