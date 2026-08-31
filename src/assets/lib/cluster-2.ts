import chalk from 'chalk';
import { down } from 'docker-compose';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import ora from 'ora';

import { pathToCluster } from './paths';

export type ClusterParams = {
   cpus: null | number;
   database: boolean | null;
   memory: null | number;
   module: null | string;
   name: string;
   nodes: null | number;
   port: null | number;
};

export default class Cluster {
   public readonly cpus: null | number = null;
   public readonly database: boolean | null = null;
   public readonly exist: boolean = false;
   public readonly memory: null | number = null;
   public readonly module: null | string = null;
   public readonly name: string;
   public readonly nodes: null | number = null;
   public readonly path: string;
   public readonly port: null | number = null;

   constructor(name: string) {
      this.name = name;
      this.path = pathToCluster(name);

      const info = this.readInfo();

      if (info) {
         Object.assign(this, info);
         this.exist = true;
      }
   }

   async destroy() {
      console.log();
      const spinner = ora('Removing cluster').start();

      // Handle deleting the container and removing it's files
      await down({
         commandOptions: ['--volumes'],
         cwd: this.path
      })
         .then(() => {
            rmSync(this.path, {
               force: true,
               recursive: true
            });
         })
         .then(() => {
            spinner.succeed('Cluster removed');
            console.log(chalk.green(`\nRemoved the cluster ${this.name}.\n`));
         })
         .catch((error) => {
            spinner.fail('Failed to destroy cluster');
            console.log(
               chalk.red(`\nFailed to destroy and remove cluster information:\n${error}\n`)
            );
         });
   }

   dumpInfo(): ClusterParams {
      return {
         cpus: this.cpus,
         database: this.database,
         memory: this.memory,
         module: this.module,
         name: this.name,
         nodes: this.nodes,
         port: this.port
      };
   }

   exists() {
      return this.exist;
   }

   readInfo() {
      return (
         (JSON.parse(readFileSync(join(this.path, 'info.json'), 'utf8')) as ClusterParams) ?? null
      );
   }
}
