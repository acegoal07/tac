import envPaths from 'env-paths';
import { join } from 'node:path';

/**
 * Gets the path to the CLI tools assets
 * @param {string} dir The directory in which to start from
 * @param {string[]} destination The additional layers for the end of the path
 * @returns {string} The completed path
 */
export function pathToCLIAssets(dir: string, ...destination: string[]): string {
   return join(dir, '..', ...destination);
}

/**
 * Gets the path to the cluster folder created by the CLI
 * @param {string} name The name of the cluster
 * @returns {string} The completed path
 */
export function pathToCluster(name: string): string {
   return join(envPaths('tac').data, name);
}
