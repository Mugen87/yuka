/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Node } from '../../graph/core/Node.js';
import { Vector3 } from '../../math/Vector3.js';

class NavNode extends Node {

	constructor( index = - 1, position = new Vector3(), userData = {} ) {

		super( index );

		this.position = position;
		this.userData = userData;

	}

}

export { NavNode };
