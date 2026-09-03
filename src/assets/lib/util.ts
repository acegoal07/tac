import Dockerode from 'dockerode';
import { appendFileSync, chmodSync, writeFileSync } from 'node:fs';
import { utils } from 'ssh2';

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
