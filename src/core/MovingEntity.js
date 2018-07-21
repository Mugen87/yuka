/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from './GameEntity.js';
import { Quaternion } from '../math/Quaternion.js';
import { Vector3 } from '../math/Vector3.js';

const targetRotation = new Quaternion();

class MovingEntity extends GameEntity {

	constructor() {

		super();

		this.velocity = new Vector3();
		this.mass = 1;
		this.maxSpeed = 1; // the maximum speed at which this entity may travel
		this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)
		this.maxTurnRate = Math.PI; // the maximum rate (radians per second) at which this vehicle can rotate

	}

	// given a target position, this method rotates the entity by an amount not
	// greater than maxTurnRate until it directly faces the target

	rotateToTarget( target ) {

		targetRotation.lookAt( target, this.position, this.up );
		this.rotation.rotateTowards( targetRotation, this.maxTurnRate );

		// adjust velocity

		this.velocity.applyRotation( this.rotation );

		return this;

	}

	lookAt( target ) {

		this.rotation.lookAt( target, this.position, this.up );

		return this;

	}

	getDirection( result ) {

		return result.set( 0, 0, 1 ).applyRotation( this.rotation ).normalize();

	}

	getSpeed() {

		return this.velocity.length();

	}

	getSpeedSquared() {

		return this.velocity.squaredLength();

	}

}

export { MovingEntity };
