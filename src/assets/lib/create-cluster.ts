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

import { pathToCLIAssets } from './paths';
import { clusterParams } from './types';
import { createKeyPair, createNodeName } from './util';

export default function createCluster(data: clusterParams, clusterPath: string) {
   try {
      // Reused variables
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
      const loginKeyPub = createKeyPair(
         authorizedKeys,
         join(clusterPath, 'hostkeys', 'login_ssh_host_ed25519_key')
      );
      appendFileSync(join(clusterPath, 'known_hosts'), `login ${loginKeyPub}\n`);
      spinner.succeed('Generated login key');

      // Generate database keys
      spinner = ora('Generating database key').start();
      createKeyPair(authorizedKeys, join(clusterPath, 'hostkeys', 'database_ssh_host_ed25519_key'));
      spinner.succeed('Generated database key');

      // Generate node host keys
      spinner = ora('Generating node keys').start();
      for (let i = 1; i <= data.nodes; i++) {
         const nodeName = createNodeName(i);

         const publicKey = createKeyPair(
            authorizedKeys,
            join(clusterPath, 'hostkeys', `${nodeName}_ssh_host_ed25519_key`)
         );

         appendFileSync(join(clusterPath, 'known_hosts'), `${createNodeName(i)} ${publicKey}\n`);
      }

      spinner.succeed('Generated host keys');

      // Generate key for moving between clusters
      spinner = ora('Generating shared cluster key').start();
      createKeyPair(authorizedKeys, join(clusterPath, `shared_cluster_key`));
      spinner.succeed('Generated shared key');

      // Setup eta
      const eta = new Eta({
         views: pathToCLIAssets(__dirname, 'templates')
      });

      // Create compose.yaml
      spinner = ora('Generating compose file').start();
      writeFileSync(join(clusterPath, 'compose.yaml'), eta.render('creation', data));
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
      copyFileSync(
         pathToCLIAssets(__dirname, 'docker', 'entrypoint-database.sh'),
         join(clusterPath, 'entrypoint-database.sh')
      );
      copyFileSync(
         pathToCLIAssets(__dirname, 'docker', 'entrypoint-login.sh'),
         join(clusterPath, 'entrypoint-login.sh')
      );
      copyFileSync(
         pathToCLIAssets(__dirname, 'docker', 'entrypoint-compute.sh'),
         join(clusterPath, 'entrypoint-compute.sh')
      );
      cpSync(pathToCLIAssets(__dirname, 'setup_scripts'), join(clusterPath, 'setup_scripts'), {
         recursive: true
      });
      spinner.succeed('Copied docker files');

      // Generate cluster configs
      spinner = ora('Generating cluster configs').start();
      writeFileSync(join(clusterPath, 'conf', 'slurm.conf'), eta.render('slurmconf', data));
      if (data.database) {
         writeFileSync(join(clusterPath, 'conf', 'slurmdbd.conf'), eta.render('slurmdbd', data));
      }

      spinner.succeed('Generated slurm configs');

      spinner = ora('Creating info.json');
      writeFileSync(join(clusterPath, 'info.json'), JSON.stringify(data));
      spinner.succeed('Created info.json');

      // Generate munge key
      spinner = ora('Generating munge key').start();
      writeFileSync(join(clusterPath, 'munge.key'), randomBytes(256));
      spinner.succeed('Copied docker files');
      return true;
   } catch {
      return false;
   }
}
