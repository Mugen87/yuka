import { Node } from '../../graph/core/Node.js';
import { Vector3 } from '../../math/Vector3.js';

/**
* Class for representing navigation nodes.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Node
*/
class NavNode extends Node {

	/**
	* Constructs a new navigation node.
	*
	* @param {Number} index - The unique index of this node.
	* @param {Vector3} position - The position of the node in 3D space.
	* @param {Object} userData - Custom user data connected to this node.
	*/
	constructor( index = - 1, position = new Vector3(), userData = {} ) {

		super( index );

		/**
		* The position of the node in 3D space.
		* @type {Vector3}
		*/
		this.position = position;

		/**
		* Custom user data connected to this node.
		* @type {Object}
		*/
		this.userData = userData;

	}

}

export { NavNode };
