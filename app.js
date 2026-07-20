const ClusterBuilder = require('./assets/classes/ClusterBuilder');

const args = process.argv.slice(2);

const builder = new ClusterBuilder();

args.forEach((option) => {
   const [key, value] = option.split('=');

   switch (key.toLowerCase()) {
      case 'mem':
      case '-mem':
      case '--mem':
      case 'm':
      case '-m':
      case '--m':
      case 'memory':
         if (Number.isNaN(Number(value))) {
            throw new TypeError('The memory amount provided is not a number');
         }

         if (!value) {
            break;
         }

         builder.memoryMB = Number(value);
         break;
      case 'n':
      case '-n':
      case '--n':
      case 'node':
         if (Number.isNaN(Number(value))) {
            throw new TypeError('The node amount provided is not a number');
         }

         if (!value) {
            break;
         }

         builder.nodeCount = Number(value);
         break;
      default:
         console.warn('A option passed in was invalid');
   }
});

console.log(builder);
