import { down } from 'docker-compose';
import { Eta } from 'eta';
import { randomBytes } from 'node:crypto';
import { appendFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { pathToCLIAssets, pathToCluster } from './paths';
import { createKeyPair, createNodeName } from './util';

export type ClusterOptions = {
   cpus: number;
   database: boolean | null;
   memory: number;
   module: string;
   name: string;
   nodes: number;
   port: number;
};

export default class Cluster {
   public readonly name: string;
   public readonly path: string;
   private options: ClusterOptions | null;

   /**
    * Create's the cluster class
    * @param {string} name The name of the cluster
    */
   constructor(name: string) {
      this.name = name;
      this.path = pathToCluster(name);
      this.options = this.readInfo();
   }

   /**
    * Create's all the clusters information
    * @param {ClusterOptions} options The cluster options
    * @returns {boolean} Whether or not the creation was successful
    */
   create(options: ClusterOptions): boolean {
      try {
         // Reused variables
         const authorizedKeys = join(this.path, 'authorized_keys');

         // Make required directories
         mkdirSync(this.path, { recursive: true });
         mkdirSync(join(this.path, 'hostkeys'), { recursive: true });
         mkdirSync(join(this.path, 'conf'), { recursive: true });

         //  Generate cluster keys
         createKeyPair(authorizedKeys, join(this.path, 'cluster_key'));

         // Generate login node keys
         const loginKeyPub = createKeyPair(
            authorizedKeys,
            join(this.path, 'hostkeys', 'login_ssh_host_ed25519_key')
         );
         appendFileSync(join(this.path, 'known_hosts'), `login ${loginKeyPub}\n`);

         // Generate database keys
         createKeyPair(
            authorizedKeys,
            join(this.path, 'hostkeys', 'database_ssh_host_ed25519_key')
         );

         // Generate node host keys
         for (let i = 1; i <= options.nodes!; i++) {
            const nodeName = createNodeName(i);

            const publicKey = createKeyPair(
               authorizedKeys,
               join(this.path, 'hostkeys', `${nodeName}_ssh_host_ed25519_key`)
            );

            appendFileSync(join(this.path, 'known_hosts'), `${createNodeName(i)} ${publicKey}\n`);
         }

         // Generate key for moving between clusters
         createKeyPair(authorizedKeys, join(this.path, `shared_cluster_key`));

         // Setup eta
         const eta = new Eta({
            views: pathToCLIAssets(__dirname, 'templates')
         });

         // Create compose.yaml
         writeFileSync(join(this.path, 'compose.yaml'), eta.render('creation', options));

         // Copy all required docker files
         cpSync(pathToCLIAssets(__dirname, 'docker'), this.path, {
            recursive: true
         });

         cpSync(pathToCLIAssets(__dirname, 'setup_scripts'), join(this.path, 'setup_scripts'), {
            recursive: true
         });

         // Generate cluster configs
         writeFileSync(join(this.path, 'conf', 'slurm.conf'), eta.render('slurmconf', options));
         if (options.database) {
            writeFileSync(
               join(this.path, 'conf', 'slurmdbd.conf'),
               eta.render('slurmdbd', options)
            );
         }

         // Create cluster information file
         writeFileSync(join(this.path, 'info.json'), JSON.stringify(options));

         // Generate munge key
         writeFileSync(join(this.path, 'munge.key'), randomBytes(256));

         // Set the class information
         this.options = options;

         return true;
      } catch {
         return false;
      }
   }

   /**
    * Destroys the cluster, removes it's files and deletes it's images
    * @returns {boolean} Whether the destroying of the cluster was successful
    */
   async destroy(): Promise<boolean> {
      try {
         await down({
            commandOptions: ['-v', ['--rmi', 'all']],
            cwd: this.path
         });

         rmSync(this.path, {
            force: true,
            recursive: true
         });

         return true;
      } catch {
         return false;
      }
   }

   /**
    * Returns all the options from the cluster
    * @returns {ClusterOptions | null} The clusters information
    */
   dumpInfo(): ClusterOptions | null {
      return this.options;
   }

   /**
    * Checks whether the clusters exists or not
    * @returns {boolean} Whether ot not the clusters exists
    */
   exists(): boolean {
      return this.options !== null;
   }

   /**
    * Reads the cluster information from it's JSON file
    * @returns {ClusterOptions | null} The cluster options
    */
   readInfo(): ClusterOptions | null {
      try {
         return (
            (JSON.parse(readFileSync(join(this.path, 'info.json'), 'utf8')) as ClusterOptions) ??
            null
         );
      } catch {
         return null;
      }
   }
}
