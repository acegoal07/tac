/**
 * Creates the name of a node using it's index and has option for more padding before the number
 * @param index
 * @returns
 */
export function createNodeName(index: number): string {
   return `node${String(index).padStart(2, '0')}`;
}
