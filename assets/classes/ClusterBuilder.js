const { ModuleManager } = require('../enums/Enums');

module.exports = class ClusterBuilder {
   constructor() {
      /**
       * This is what module manager for the builder to use
       * @type {import('../enums/Enums').ModuleManager}
       * @default ModuleManager.None
       */
      this.moduleManager = ModuleManager.None;

      /**
       * This is how much memory for the cluster to use
       * @type {Integer}
       * * @default 1024
       */
      this.memoryMB = 1024;

      /**
       * This is how many nodes to give the cluster
       * @type {Integer}
       * * @default 1
       */
      this.nodeCount = 1;
   }
};
