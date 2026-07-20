const { ModuleManager } = require('../enums/Enums');
const fs = require('node:fs');
const keygen = require('ssh-keygen');

module.exports = class ClusterBuilder {
   constructor() {
      /**
       * This is what module manager for the builder to use
       * @type {import('../enums/Enums').ModuleManager}
       */
      this.moduleManager = ModuleManager.None;

      /**
       * This is how much memory for the cluster to use
       * @type {Integer}
       */
      this.memoryMB = 1024;

      /**
       * This is how many nodes to give the cluster
       * @type {Integer}
       */
      this.nodeCount = 1;

      /**
       * This is the name of the cluster
       * @type {String}
       */
      this.name = 'KindOfaCluster';
   }

   /**
    * Builds the cluster
    * @param {String} dir
    * @returns {void}
    */
   async build(dir) {
      fs.mkdirSync(`${dir}/clusters/${this.name}`, { recursive: true });

      keygen(
         {
            location: `${dir}/clusters/${this.name}/cluster_key`
         },
         function (error, _out) {
            if (error) {
               return console.log('Something went wrong: ' + error);
            }
         }
      );
   }
};
