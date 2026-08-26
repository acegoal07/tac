import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { Eta } from 'eta';
import { randomBytes } from 'node:crypto';
import {
   appendFileSync,
   copyFileSync,
   cpSync,
   existsSync,
   mkdirSync,
   writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import ora from 'ora';

import { pathToCLIAssets, pathToCluster } from '../assets/lib/paths';
import { createKeyPair, createNodeName } from '../assets/lib/util';

export default class CreateIndex extends Command {
   static override readonly description = 'describe the command here';
   static override readonly flags = {
      count: Flags.integer({
         char: 'c',
         default: 1,
         description: 'How many nodes to give to the cluster',
         min: 1
      }),
      database: Flags.boolean({
         char: 'd',
         default: false,
         description: 'Whether or not a database should be setup for the cluster'
      }),
      memory: Flags.integer({
         char: 'm',
         default: 1024,
         description: 'How much memory will be given to the cluster',
         min: 1024
      }),
      module: Flags.string({
         char: 'M',
         default: 'lmod',
         description: 'The module loader type to use in the cluster'
      }),
      name: Flags.string({
         char: 'N',
         default: 'tac',
         description: 'The name of the cluster'
      }),
      port: Flags.integer({
         char: 'p',
         default: 2200,
         description: 'Which port to use for the SSH',
         max: 2300,
         min: 2200
      })
   };

   public async run(): Promise<void> {
      const { flags } = await this.parse(CreateIndex);

      // Reused variables
      const clusterPath = pathToCluster(flags.name);
      const authorizedKeys = join(clusterPath, 'authorized_keys');

      // Check to make sure a cluster doesn't already exist
      if (existsSync(clusterPath)) {
         return console.log(`\nA cluster with that name already exists\n`);
      }

      // Make required directories
      mkdirSync(clusterPath, { recursive: true });
      mkdirSync(join(clusterPath, 'hostkeys'), { recursive: true });
      mkdirSync(join(clusterPath, 'conf'), { recursive: true });

      //  Generate cluster keys
      console.log();
      let spinner = ora('Generating cluster key').start();

      createKeyPair(authorizedKeys, join(clusterPath, 'cluster_key'));
      spinner.succeed('Generated cluster key');

      // Generate login node keys
      spinner = ora('Generating login node key').start();
      createKeyPair(authorizedKeys, join(clusterPath, 'hostkeys', 'login_ssh_host_ed25519_key'));
      spinner.succeed('Generated login key');

      // Generate node keys
      spinner = ora('Generating node keys').start();
      for (let i = 1; i <= flags.count; i++) {
         createKeyPair(
            authorizedKeys,
            join(clusterPath, 'hostkeys', `${createNodeName(i)}_ssh_host_ed25519_key`)
         );
         appendFileSync(join(clusterPath, 'known_hosts'), `${createNodeName(i)}\n`);
      }

      spinner.succeed('Generated host keys');

      // Setup eta
      const eta = new Eta({
         views: pathToCLIAssets(__dirname, 'templates')
      });

      console.log(pathToCLIAssets(__dirname, 'templates'));

      // Create compose.yaml
      spinner = ora('Generating compose file').start();
      writeFileSync(join(clusterPath, 'compose.yaml'), eta.render('creation', flags));
      spinner.succeed('Generated compose file');

      // Copy all required docker files
      spinner = ora('Copying docker files').start();
      copyFileSync(
         pathToCLIAssets(__dirname, 'docker', 'Dockerfile'),
         join(clusterPath, 'Dockerfile')
      );
      copyFileSync(
         pathToCLIAssets(__dirname, 'docker', 'entrypoint.sh'),
         join(clusterPath, 'entrypoint.sh')
      );
      cpSync(pathToCLIAssets(__dirname, 'setup_scripts'), join(clusterPath, 'setup_scripts'), {
         recursive: true
      });
      spinner.succeed('Copied docker files');

      // Generate cluster configs
      spinner = ora('Generating cluster configs').start();
      writeFileSync(join(clusterPath, 'conf', 'slurm.conf'), eta.render('slurmconf', flags));
      if (flags.database) {
         writeFileSync(join(clusterPath, 'conf', 'slurmdbd.conf'), eta.render('slurmdbd', flags));
      }

      if (flags.port !== 2200) {
         writeFileSync(join(clusterPath, 'port'), flags.port.toString());
      }

      spinner.succeed('Generated slurm configs');

      // Generate munge key
      spinner = ora('Generating munge key').start();
      writeFileSync(join(clusterPath, 'munge.key'), randomBytes(256));
      spinner.succeed('Copied docker files');

      // File location
      console.log(chalk.green(`\nThe ${flags.name} cluster has been saved to:\n${clusterPath}\n`));
   }
}
