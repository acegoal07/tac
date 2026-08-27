import { Args, Command } from '@oclif/core';

import destroyCluster from '../../assets/lib/destroy-cluster';

export default class DestroyIndex extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The docker cluster to destroy', required: true })
   };
   static override readonly description = 'Destroys a specific docker cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(DestroyIndex);
      destroyCluster(args.name);
   }
}
