/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Matrix4 } from '../math/Matrix4.js';

class GameEntity {

	constructor() {

		this.manager = null;

		this.id = GameEntity.__nextId ++;
		this.name = '';
		this.tag = '';

		this.position = new Vector3();
		this.rotation = new Quaternion();
		this.scale = new Vector3( 1, 1, 1 );

		this.up = new Vector3( 0, 1, 0 );
		this.boundingRadius = 0;

		this.matrix = new Matrix4();

	}

	update() {}

	sendMessage( receiver, message, delay = 0, data = null ) {

		this.manager.sendMessage( this, receiver, message, delay, data );

	}

	handleMessage() {

		return false;

	}

	updateMatrix() {

		this.matrix.compose( this.position, this.rotation, this.scale );

	}

}

GameEntity.__nextId = 0;

export { GameEntity };
