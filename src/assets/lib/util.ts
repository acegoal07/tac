import Dockerode from 'dockerode';
import { appendFileSync, chmodSync, writeFileSync } from 'node:fs';
import { Client, utils } from 'ssh2';

import Cluster from './cluster';

/**
 * Creates the name of a node using it's index and has option for more padding before the number
 * @param {number} index The position of the node name
 * @returns {string} The created node name
 */
export function createNodeName(index: number): string {
   return `node${String(index).padStart(2, '0')}`;
}

/**
 * Handles creating a cluster key pair
 * @param {string} authorizedKeysPath The path to authorised keys
 * @param {string} destination the destination of the keys (Shouldn't include file extensions as it'll be used for both public and private key)
 * @returns {{
 *    private: string;
 *    public: string;
 * }} The generated keyPair
 */
export function createKeyPair(
   authorizedKeysPath: string,
   destination: string
): { private: string; public: string } {
   const keyPair = utils.generateKeyPairSync('ed25519');

   writeFileSync(`${destination}.pub`, keyPair.public);
   chmodSync(`${destination}.pub`, 0o644);

   writeFileSync(destination, keyPair.private);
   chmodSync(destination, 0o600);

   appendFileSync(authorizedKeysPath, `${keyPair.public} \n`);

   return keyPair;
}

/**
 * Whether or not the ssh demon is running in the cluster
 * @param {string} name The name of the cluster
 * @param {number} timeout How long before the check should timeout
 * @returns {Promise<boolean>} Whether or not the demon is running
 */
export function sshdRunning(name: string, timeout = 20_000): Promise<boolean> {
   return new Promise((resolve) => {
      const deadline = Date.now() + timeout;
      const cluster = new Cluster(name);
      let resolved = false;

      const finish = (result: boolean) => {
         if (resolved) {
            return;
         }

         resolved = true;
         resolve(result);
      };

      const check = () => {
         if (resolved) {
            return;
         }

         const remaining = deadline - Date.now();

         if (remaining <= 0) {
            finish(false);
            return;
         }

         const conn = new Client();

         conn.on('ready', () => {
            conn.end();
            finish(true);
         });

         conn.on('error', () => {
            conn.destroy();

            if (Date.now() < deadline) {
               setTimeout(check, 500);
            } else {
               finish(false);
            }
         });

         conn.connect(cluster.connectionInfo());
      };

      check();
   });
}

/**
 * Checks whether or not docker is running on the system
 * @returns {boolean} Whether or not docker is running
 */
export async function dockerUp(): Promise<boolean> {
   const docker = new Dockerode();

   try {
      await docker.ping();
      return true;
   } catch {
      return false;
   }
}
