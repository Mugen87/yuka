/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Obstacle } from '../../../../build/yuka.module.js';

class Ground extends Obstacle {

	constructor( geometry ) {

		super( geometry );

	}

	handleMessage() {

		// do nothing

		return true;

	}

}

export { Ground };
