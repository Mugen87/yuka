/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Node } from '../core/Node.js';

class NavNode extends Node {

	constructor( index, position, userData = {} ) {

		super( index );

		this.position = position;
		this.userData = userData;

	}

}

export { NavNode };
