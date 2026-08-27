import { appendFileSync, chmodSync, writeFileSync } from 'node:fs';
import { Client, utils } from 'ssh2';

import createConnectionObject from './create-connection-object';

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

   return keyPair.public;
}

export function sshdRunning(name: string, timeout = 20_000): Promise<boolean> {
   return new Promise((resolve) => {
      const deadline = Date.now() + timeout;
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

         conn.connect(createConnectionObject(name));
      };

      check();
   });
}
