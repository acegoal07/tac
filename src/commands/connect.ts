import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { Client } from 'ssh2';

import Cluster from '../assets/lib/cluster';
import createConnectionObject from '../assets/lib/create-connection-object';

export default class Connect extends Command {
   static override readonly args = {
      name: Args.string({ description: 'The name of the cluster to SSH into', required: true })
   };
   static override readonly description =
      'Handles connecting to the cluster that the cli has corrected';

   public async run(): Promise<void> {
      const { args } = await this.parse(Connect);

      const cluster = new Cluster(args.name);

      if (!cluster.exists()) {
         return console.log(chalk.yellow(`\nNo cluster with that name exists\n`));
      }

      const conn = new Client();

      await new Promise<void>((resolve, reject) => {
         conn.on('ready', () => {
            conn.shell((err, stream) => {
               if (err) {
                  return reject(err);
               }

               stream.on('data', (data: Buffer) => {
                  process.stdout.write(data);
               });

               process.stdin.on('data', (data: Buffer) => {
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

         conn.on('error', reject);

         conn.connect(createConnectionObject(args.name));
      });
   }
}
