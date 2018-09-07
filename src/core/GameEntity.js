/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Logger } from './Logger.js';

let nextId = 0;

const targetRotation = new Quaternion();
const targetDirection = new Vector3();

class GameEntity {

	constructor() {

		this.id = nextId ++;
		this.name = '';

		this.active = true;

		this.cache = {
			position: new Vector3(),
			rotation: new Quaternion(),
			scale: new Vector3()
		};

		this.position = new Vector3();
		this.rotation = new Quaternion();
		this.scale = new Vector3( 1, 1, 1 );

		this.forward = new Vector3( 0, 0, 1 );
		this.up = new Vector3( 0, 1, 0 );

		this.boundingRadius = 0;
		this.maxTurnRate = Math.PI;

		this.matrix = new Matrix4();

		this.manager = null;

	}

	// lifecycle callbacks

	start() {}

	update( /* delta */ ) {}

	//

	getDirection( result ) {

		return result.copy( this.forward ).applyRotation( this.rotation ).normalize();

	}

	// directly rotates the entity so it faces the target

	lookAt( target ) {

		targetDirection.subVectors( target, this.position ).normalize();

		this.rotation.lookAt( this.forward, targetDirection, this.up );

		return this;

	}

	// given a target position, this method rotates the entity by an amount not
	// greater than maxTurnRate until it directly faces the target

	rotateTo( target, deltaTime ) {

		targetDirection.subVectors( target, this.position ).normalize();
		targetRotation.lookAt( this.forward, targetDirection, this.up );

		this.rotation.rotateTo( targetRotation, this.maxTurnRate * deltaTime );

		return this;

	}

	// updates the internal transformation matrix if necessary

	updateMatrix() {

		const cache = this.cache;

		if ( cache.position.equals( this.position ) &&
				cache.rotation.equals( this.rotation ) &&
				cache.scale.equals( this.scale ) ) {

			return;

		}

		this.matrix.compose( this.position, this.rotation, this.scale );

		cache.position.copy( this.position );
		cache.rotation.copy( this.rotation );
		cache.scale.copy( this.scale );

	}

	// messaging

	handleMessage() {

		return false;

	}

	sendMessage( receiver, message, delay = 0, data = null ) {

		if ( this.manager !== null ) {

			this.manager.sendMessage( this, receiver, message, delay, data );

		} else {

			Logger.error( 'YUKA.GameEntity: The game entity must be added to a manager in order to send a message.' );

		}

	}

}

export { GameEntity };
