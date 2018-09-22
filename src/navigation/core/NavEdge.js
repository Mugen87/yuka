/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Edge } from '../../graph/core/Edge.js';

class NavEdge extends Edge {

	constructor( from = - 1, to = - 1, cost = 0 ) {

		super( from, to, cost );

	}

}

export { NavEdge };
