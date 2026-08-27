import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { pathToCluster } from './paths';

interface ClusterParams {
   cpus: number;
   database: boolean;
   memory: number;
   module: string;
   name: string;
   nodes: number;
   port: number;
}

export default class Cluster {
   public readonly cpus!: number;
   public readonly database!: boolean;
   public readonly memory!: number;
   public readonly module!: string;
   public readonly name!: string;
   public readonly nodes!: number;
   public readonly port!: number;

   constructor(name: string) {
      const clusterDir = pathToCluster(name);
      const info = JSON.parse(readFileSync(join(clusterDir, 'info.json'), 'utf8')) as ClusterParams;

      Object.assign(this, info);
   }
}
