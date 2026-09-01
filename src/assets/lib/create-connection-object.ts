import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Cluster from './cluster';

/**
 * Creates the connection
 * @param name The name of the cluster
 * @returns {{
 *    host: string;
 *    port: number;
 *    privateKey: string;
 *    username: string;
 * }} The connection information for the connection
 */
export default function createConnectionObject(name: string): {
   host: string;
   port: number;
   privateKey: string;
   username: string;
} {
   const cluster = new Cluster(name);

   return {
      host: 'localhost',
      port: cluster.dumpInfo()?.port ?? 2200,
      privateKey: readFileSync(join(cluster.path, 'cluster_key'), 'utf8'),
      username: 'dev'
   };
}
