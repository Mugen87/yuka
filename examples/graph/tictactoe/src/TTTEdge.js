/**
* @author robp94 / https://github.com/robp94
*/

import { Edge } from '../../../../build/yuka.module.js';

class TTTEdge extends Edge {

	constructor( from, to, cell, player ) {

		super( from, to );

		// the following properties represent the move which
		// transitions from one board to the next one

		this.cell = cell; // the chosen cell/field
		this.player = player; // this player made the move

	}

}

export { TTTEdge };
