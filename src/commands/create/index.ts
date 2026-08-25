import { Command, Flags } from '@oclif/core';
import { upAll } from 'docker-compose';
import { Eta } from 'eta';
import { randomBytes } from 'node:crypto';
import { appendFileSync, chmodSync, copyFileSync, cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ora from 'ora';
import { utils } from 'ssh2';

export default class CreateIndex extends Command {
   static override readonly description = 'describe the command here';
   static override readonly flags = {
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
         char: 'N',
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
      const clusterPath = join(__dirname, '..', '..', 'clusters', flags.name);

      mkdirSync(clusterPath, { recursive: true });

      let spinner = ora('Generating cluster key').start();

      const clusterKey = utils.generateKeyPairSync('ed25519');
      writeFileSync(join(clusterPath, 'cluster_key.pub'), clusterKey.public);
      writeFileSync(join(clusterPath, 'cluster_key'), clusterKey.private);
      chmodSync(join(clusterPath, 'cluster_key'), 0o600);
      writeFileSync(join(clusterPath, 'authorized_keys'), `${clusterKey.public}\n`);

      spinner.succeed('Generated cluster key');
      spinner = ora('Generating login key').start();

      mkdirSync(join(clusterPath, 'hostkeys'), { recursive: true });

      const loginKey = utils.generateKeyPairSync('ed25519');
      writeFileSync(
         join(clusterPath, 'hostkeys', 'login_ssh_host_ed25519_key.pub'),
         loginKey.public
      );
      writeFileSync(join(clusterPath, 'hostkeys', 'login_ssh_host_ed25519_key'), loginKey.private);
      chmodSync(join(clusterPath, 'hostkeys', 'login_ssh_host_ed25519_key'), 0o600);
      appendFileSync(join(clusterPath, 'authorized_keys'), `${loginKey.public}\n`);

      spinner.succeed('Generated login key');
      spinner = ora('Generating host keys').start();

      for (let i = 1; i <= flags.count; i++) {
         const keys = utils.generateKeyPairSync('ed25519');
         writeFileSync(
            join(clusterPath, 'hostkeys', `node${String(i).padStart(2, '0')}_ssh_host_ed25519_key`),
            keys.private
         );
         chmodSync(
            join(clusterPath, 'hostkeys', `node${String(i).padStart(2, '0')}_ssh_host_ed25519_key`),
            0o600
         );
         writeFileSync(
            join(
               clusterPath,
               'hostkeys',
               `node${String(i).padStart(2, '0')}_ssh_host_ed25519_key.pub`
            ),
            keys.public
         );
         appendFileSync(join(clusterPath, 'authorized_keys'), `${keys.public}\n`);
         chmodSync(join(clusterPath, 'authorized_keys'), 0o600);
         appendFileSync(join(clusterPath, 'known_hosts'), `node${String(i).padStart(2, '0')}\n`);
      }

      spinner.succeed('Generated host keys');

      const eta = new Eta({
         views: join(__dirname, '..', '..', 'assets', 'templates')
      });

      spinner = ora('Generating compose file').start();

      writeFileSync(join(clusterPath, 'compose.yaml'), eta.render('creation.ts.eta', flags));

      spinner.succeed('Generated compose file');
      spinner = ora('Copying docker files').start();

      copyFileSync(
         join(__dirname, '..', '..', 'assets', 'docker', 'Dockerfile'),
         join(clusterPath, 'Dockerfile')
      );
      copyFileSync(
         join(__dirname, '..', '..', 'assets', 'docker', 'entrypoint.sh'),
         join(clusterPath, 'entrypoint.sh')
      );
      cpSync(
         join(__dirname, '..', '..', 'assets', 'setup_scripts'),
         join(clusterPath, 'setup_scripts'),
         { recursive: true }
      );

      spinner.succeed('Copied docker files');
      spinner = ora('Generating slurm configs').start();

      mkdirSync(join(clusterPath, 'conf'), { recursive: true });

      writeFileSync(join(clusterPath, 'conf', 'slurm.conf'), eta.render('slurmconf', flags));

      writeFileSync(join(clusterPath, 'conf', 'slurmdbd.conf'), eta.render('slurmdbd', flags));

      spinner.succeed('Generated slurm config');
      spinner = ora('Generating munge key').start();

      writeFileSync(join(clusterPath, 'munge.key'), randomBytes(256));

      spinner.succeed('Copied docker files');
      await upAll({ cwd: clusterPath }).catch((error) => console.log(error));
   }
}
