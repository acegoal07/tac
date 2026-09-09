import envPaths from 'env-paths';
import path from 'node:path';

/**
 * Gets the path to the CLI tools assets
 * @param dir The directory in which to start from
 * @param destination The additional layers for the end of the path
 * @returns The completed path
 */
export function pathToCLIAssets(dir: string, ...destination: string[]): string {
   return path.join(dir, '..', ...destination);
}

/**
 * Gets the path to the cluster folder created by the CLI
 * @param name The name of the cluster
 * @returns The completed path
 */
export function pathToCluster(name?: string): string {
   return path.join(envPaths('tac').data, name ?? '');
}
