/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from './GameEntity';
import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
import { Vector3 } from '../math/Vector3';

class MovingEntity extends GameEntity {

	constructor () {

		super();

		this.velocity = new Vector3();
		this.mass = 1;
		this.maxSpeed = 1; // the maximum speed at which this entity may travel
		this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)
		this.maxTurnRate = Math.PI; // the maximum rate (radians per second) at which this vehicle can rotate

	}

	getDirection ( optionalTarget ) {

		const result = optionalTarget || new Vector3();

		return result.set( 0, 0, 1 ).applyQuaternion( this.rotation ).normalize();

	}

	getSpeed () {

		return this.velocity.length();

	}

	getSpeedSquared () {

		return this.velocity.lengthSquared();

	}

}

Object.assign( MovingEntity.prototype, {

	// given a target position, this method rotates the entity by an amount not
	// greater than maxTurnRate until it directly faces the target

	rotateToTarget: function () {

		const direction = new Vector3();
		const rotationMatrix = new Matrix4();
		const targetRotation = new Quaternion();

		return function rotateToTarget ( target ) {

			this.getDirection( direction );

			// first determine the angle between the look vector and the target

			const angle = target.angleTo( direction );

			// return true if the player is facing the target

			if ( angle < 0.00001 ) return true;

			// clamp the amount to turn to the max turn rate

			const t = ( angle > this.maxTurnRate ) ? ( this.maxTurnRate / angle ) : 1;

			// get target rotation

			rotationMatrix.lookAt( target, this.position, this.up );
			targetRotation.setFromRotationMatrix( rotationMatrix );

			// interpolate

			this.rotation.slerp( targetRotation, t );

			// adjust velocity

			this.velocity.applyQuaternion( this.rotation );

			return false;

		};

	} (),

	lookAt: function () {

		const rotationMatrix = new Matrix4();

		return function lookAt ( target ) {

			console.log( this.position );

			rotationMatrix.lookAt( target, this.position, this.up );
			this.rotation.setFromRotationMatrix( rotationMatrix );

			return this;

		};

	} ()

} );

export { MovingEntity };
