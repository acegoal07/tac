import { appendFileSync, chmodSync, writeFileSync } from 'node:fs';
import { utils } from 'ssh2';

/**
 * Creates the name of a node using it's index and has option for more padding before the number
 * @param index
 * @returns
 */
export function createNodeName(index: number): string {
   return `node${String(index).padStart(2, '0')}`;
}

/**
 * Handles creating a cluster key pair
 * @param authorizedKeysPath
 * @param destination
 */
export function createKeyPair(authorizedKeysPath: string, destination: string) {
   const keyPair = utils.generateKeyPairSync('ed25519');

   writeFileSync(`${destination}.pub`, keyPair.public);
   chmodSync(`${destination}.pub`, 0o644);

   writeFileSync(destination, keyPair.private);
   chmodSync(destination, 0o600);

   appendFileSync(authorizedKeysPath, `${keyPair.public} \n`);
}
