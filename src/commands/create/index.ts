import { Command, Flags } from '@oclif/core';
import { upAll } from 'docker-compose';
import { Eta } from 'eta';
import { randomBytes } from 'node:crypto';
import { appendFileSync, copyFileSync, cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ora from 'ora';
import { createKeyPair, createNodeName } from '../../assets/lib/util';
import { pathToCLIAssets, pathToCluster } from '../../assets/lib/paths';

export default class CreateIndex extends Command {
   static override readonly description = 'describe the command here';
   static override readonly flags = {
      database: Flags.boolean({
         char: 'd',
         default: true,
         description: 'Whether or not a database should be setup for the cluster'
      }),
      count: Flags.integer({
         char: 'c',
         default: 1,
         description: 'How many nodes to give to the cluster',
         min: 1
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
         default: 'KindOfaCluster',
         description: 'The name of the cluster',
         required: true
      })
   };

   public async run(): Promise<void> {
      const { flags } = await this.parse(CreateIndex);
      const clusterPath = pathToCluster(__dirname, flags.name);

      // Make required directories
      mkdirSync(clusterPath, { recursive: true });
      mkdirSync(join(clusterPath, 'hostkeys'), { recursive: true });
      mkdirSync(join(clusterPath, 'conf'), { recursive: true });

      let spinner = ora('Generating cluster key').start();

      createKeyPair(join(clusterPath, 'authorized_keys'), join(clusterPath, 'cluster_key'));

      spinner.succeed('Generated cluster key');
      spinner = ora('Generating login key').start();

      createKeyPair(
         join(clusterPath, 'authorized_keys'),
         join(clusterPath, 'hostkeys', 'login_ssh_host_ed25519_key')
      );

      spinner.succeed('Generated login key');
      spinner = ora('Generating host keys').start();

      for (let i = 1; i <= flags.count; i++) {
         createKeyPair(
            join(clusterPath, 'authorized_keys'),
            join(clusterPath, 'hostkeys', `${createNodeName(i)}_ssh_host_ed25519_key`)
         );
         appendFileSync(join(clusterPath, 'known_hosts'), `${createNodeName(i)}\n`);
      }

      spinner.succeed('Generated host keys');

      const eta = new Eta({
         views: pathToCLIAssets(__dirname, 'templates')
      });

      spinner = ora('Generating compose file').start();

      writeFileSync(join(clusterPath, 'compose.yaml'), eta.render('creation.ts.eta', flags));

      spinner.succeed('Generated compose file');
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
      spinner = ora('Generating slurm configs').start();

      writeFileSync(join(clusterPath, 'conf', 'slurm.conf'), eta.render('slurmconf', flags));
      writeFileSync(join(clusterPath, 'conf', 'slurmdbd.conf'), eta.render('slurmdbd', flags));

      spinner.succeed('Generated slurm config');
      spinner = ora('Generating munge key').start();

      writeFileSync(join(clusterPath, 'munge.key'), randomBytes(256));

      spinner.succeed('Copied docker files');
      spinner = ora('Initialising docker compose').start();

      await upAll({ cwd: clusterPath }).catch((error) => console.log(error));

      spinner.succeed('Initialised docker compose');
   }
}
