import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Cluster from './cluster';

export default function createConnectionObject(name: string): {
   host: string;
   port: number;
   privateKey: string;
   username: string;
} {
   const cluster = new Cluster(name);

   return {
      host: 'localhost',
      port: cluster.port,
      privateKey: readFileSync(join(cluster.path, 'cluster_key'), 'utf8'),
      username: 'dev'
   };
}
