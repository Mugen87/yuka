/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from './GameEntity.js';
import { Quaternion } from '../math/Quaternion.js';
import { Vector3 } from '../math/Vector3.js';

const targetRotation = new Quaternion();
const targetDirection = new Vector3();

class MovingEntity extends GameEntity {

	constructor() {

		super();

		this.velocity = new Vector3();
		this.mass = 1;
		this.maxSpeed = 1; // the maximum speed at which this entity may travel
		this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)
		this.maxTurnRate = Math.PI; // the maximum rate (radians per second) at which this vehicle can rotate

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

	getDirection( result ) {

		return result.copy( this.forward ).applyRotation( this.rotation ).normalize();

	}

	getSpeed() {

		return this.velocity.length();

	}

	getSpeedSquared() {

		return this.velocity.squaredLength();

	}

}

export { MovingEntity };
