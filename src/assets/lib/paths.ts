import envPaths from 'env-paths';
import { join } from 'node:path';

/**
 * Gets the path to the CLI tools assets
 * @param dir
 * @param destination
 * @returns
 */
export function pathToCLIAssets(dir: string, ...destination: string[]): string {
   return join(dir, '..', 'assets', ...destination);
}

/**
 * Gets the path to the cluster folder created by the CLI
 * @param name
 * @returns
 */
export function pathToCluster(name: string): string {
   return join(envPaths('tac').data, name);
}
