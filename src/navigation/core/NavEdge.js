import { Edge } from '../../graph/core/Edge.js';

/**
* Class for representing navigation edges.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments Edge
*/
class NavEdge extends Edge {

	/**
	* Constructs a navigation edge.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @param {Number} cost - The cost of this edge.
	*/
	constructor( from = - 1, to = - 1, cost = 0 ) {

		super( from, to, cost );

	}

}

export { NavEdge };
