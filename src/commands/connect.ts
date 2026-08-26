import { Args, Command } from '@oclif/core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'ssh2';

import { pathToCluster } from '../assets/lib/paths';

export default class Connect extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster to SSH into', required: true })
   };
   static override readonly description =
      'Handles connecting to the cluster that the cli has corrected';

   public async run(): Promise<void> {
      const { args } = await this.parse(Connect);

      // Path to cluster
      const clusterPath = pathToCluster(args.name);

      // Check that a cluster exists
      if (!existsSync(clusterPath)) {
         return console.log('No cluster exists with that name');
      }

      // Create SSH client
      const conn = new Client();

      // Setup handler for connection
      conn.on('ready', () => {
         conn.shell((err, stream) => {
            if (err) {
               this.error(err);
            }

            // Server -> terminal
            stream.on('data', (data: Buffer) => {
               process.stdout.write(data);
            });

            // Terminal -> server
            process.stdin.on('data', (data: Buffer) => {
               stream.write(data);
            });

            // Handle Ctrl+C / terminal exit
            process.stdin.setRawMode?.(true);
            process.stdin.resume();

            // Handle end
            process.stdin.on('end', () => {
               stream.end();
               conn.end();
            });

            // Handle close
            stream.on('close', () => {
               process.stdin.setRawMode?.(false);
               conn.end();
            });
         });
      });

      // Handle errors for the SSH client
      conn.on('error', (_error) => {
         console.log('Make sure the cluster you are trying to connect to is running');
      });

      // Connect to the SSH client
      conn.connect({
         host: 'localhost',
         port: 2222,
         privateKey: readFileSync(join(clusterPath, 'cluster_key')),
         username: 'dev'
      });
   }
}
