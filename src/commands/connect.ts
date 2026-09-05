import { Args, Command, ux } from '@oclif/core';
import { Client } from 'ssh2';

import Cluster from '../assets/lib/cluster.js';
import { dockerUp } from '../assets/lib/util.js';

export default class Connect extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster to SSH into', required: true })
   };

   static override readonly description =
      'Handles connecting to the cluster that the cli has corrected';

   public async run(): Promise<void> {
      const { args } = await this.parse(Connect);

      // Check whether docker is running
      if (!(await dockerUp())) {
         console.log(ux.colorize('red', '\nDocker needs to be running\n'));
         return;
      }

      // Get cluster
      const cluster = new Cluster(args.name);

      // Checks whether the cluster exists
      if (!cluster.exists()) {
         console.log(ux.colorize('yellow', '\nNo cluster with that name exists\n'));
         return;
      }

      // Check that the cluster is running
      if (!(await cluster.isUp())) {
         console.log(ux.colorize('red', '\nThe cluster needs to running to be able to connect\n'));
         return;
      }

      // Get SHH client
      const conn = new Client();

      // Handle SSH client
      await new Promise<void>((resolve, reject) => {
         conn.on('ready', () => {
            conn.shell((err, stream) => {
               if (err) {
                  reject(err);
                  return;
               }

               stream.on('data', (data: Uint8Array) => {
                  process.stdout.write(data);
               });

               process.stdin.on('data', (data: Uint8Array) => {
                  stream.write(data);
               });

               process.stdin.setRawMode?.(true);
               process.stdin.resume();

               process.stdin.on('end', () => {
                  stream.end();
                  conn.end();
               });

               stream.on('close', () => {
                  process.stdin.setRawMode?.(false);
                  process.stdin.pause();
                  conn.end();

                  resolve();
               });

               stream.on('error', reject);
            });
         });

         // Handle SSH errors
         conn.on('error', reject);

         // Connect to SSH
         conn.connect(cluster.connectionInfo());
      });
   }
}
