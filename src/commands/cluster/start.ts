import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { upAll } from 'docker-compose';
import ora from 'ora';

import Cluster from '../../assets/lib/cluster';
import { dockerUp, sshdRunning } from '../../assets/lib/util';

export default class ClusterStart extends Command {
   static override readonly args = {
      name: Args.string({
         description: 'The name of the cluster you want to start',
         required: true
      })
   };
   static override readonly description = 'Starts up the cluster';

   public async run(): Promise<void> {
      const { args } = await this.parse(ClusterStart);

      // Check whether docker is running
      if (!(await dockerUp())) {
         return console.log(chalk.red('\nDocker needs to be running\n'));
      }

      // Get the cluster
      const cluster = new Cluster(args.name);

      // Check that a cluster exists
      if (!cluster.exists()) {
         return console.log(chalk.yellow('\nNo cluster exists with that name\n'));
      }

      // Check if anything within the cluster is running
      if (await cluster.isUp()) {
         return console.log(chalk.red(`\nThe cluster is already running\n`));
      }

      // Start up container
      console.log(
         chalk.yellow(
            '\nIf this is your first time booting a cluster\nit can take a while to create the image so be patient\n'
         )
      );

      let spinner = ora('Booting cluster').start();

      await upAll({ cwd: cluster.path })
         .then(async () => {
            spinner.succeed('Successfully booted cluster');
            spinner = ora('Running initialiser scripts').start();
            const running = await sshdRunning(args.name);
            if (running) {
               spinner.succeed('SSH connection established');
               console.log(
                  chalk.green(
                     `\n${args.name} has been started and can now be connect to using:\ntac connect ${args.name}\n`
                  )
               );
               console.log(
                  chalk.yellow(
                     `Some nodes might still be booting still so might not be accessible straight away\n`
                  )
               );
            } else {
               spinner.fail('SSH connection timed out');
               console.log(
                  chalk.yellow(
                     `\n${args.name} is taking a while to start the SSH daemon\nWait a few minutes and then try connecting using: \ntac connect ${args.name}\n`
                  )
               );
            }
         })
         .catch((error) => {
            spinner.fail('Failed to boot cluster');
            console.error('\nAn error occurred while booting the cluster, ERROR:\n');
            return console.log(error);
         });
   }
}
