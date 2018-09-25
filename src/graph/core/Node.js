/**
* Base class for graph nodes.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Node {

	/**
	* Constructs a new node.
	*
	* @param {Number} index - The unique index of this node.
	*/
	constructor( index = - 1 ) {

		/**
		* The unique index of this node. The default value *-1* means invalid index.
		* @type Number
		* @default -1
		*/
		this.index = index;

	}

}

export { Node };
