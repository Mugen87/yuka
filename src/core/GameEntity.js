/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { EventDispatcher } from './EventDispatcher';
import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Matrix4 } from '../math/Matrix4';

class GameEntity extends EventDispatcher {

	constructor () {

		super();

		this.id = GameEntity.__nextId ++;
		this.name = '';

		this.position = new Vector3();
		this.rotation = new Quaternion();
		this.scale = new Vector3( 1, 1, 1 );

		this.up = new Vector3( 0, 1, 0 );
		this.boundingRadius = 0;

		this.matrix = new Matrix4();

	}

	update () {}

	sendMessage ( receiver, message, delay = 0, data = null ) {

		const event = {
			type: 'message',
			receiver: receiver,
			message: message,
			delay: delay,
			data: data
		};

		this.dispatchEvent( event );

	}

	handleMessage () {

		return false;

	}

	updateMatrix () {

		this.matrix.compose( this.position, this.rotation, this.scale );

	}

}

GameEntity.__nextId = 0;

export { GameEntity };
