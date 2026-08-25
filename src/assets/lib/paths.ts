import { join } from 'node:path';

/**
 * Gets the path to the CLI tools assets
 * @param dir
 * @param destination
 * @returns
 */
export function pathToCLIAssets(dir: string, ...destination: string[]): string {
   return join(dir, '..', '..', 'assets', ...destination);
}

/**
 * Gets the path to the cluster folder created by the CLI
 * @param dir
 * @param name
 * @param extra
 * @returns
 */
export function pathToCluster(dir: string, name: string, ...extra: string[]): string {
   return join(dir, '..', '..', 'clusters', name);
}
