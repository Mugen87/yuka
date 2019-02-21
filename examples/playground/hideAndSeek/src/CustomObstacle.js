/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from '../../../../build/yuka.module.js';

class CustomObstacle extends GameEntity {

	constructor( geometry ) {

		super();

		this.geometry = geometry;

	}

	handleMessage() {

		// do nothing

		return true;

	}

}

export { CustomObstacle };
