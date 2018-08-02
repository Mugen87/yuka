/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from './GameEntity.js';
import { Vector3 } from '../math/Vector3.js';

const displacement = new Vector3();
const target = new Vector3();

class MovingEntity extends GameEntity {

	constructor() {

		super();

		this.velocity = new Vector3();
		this.maxSpeed = 1; // the maximum speed at which this entity may travel

		this.updateOrientation = true;

	}

	update( delta ) {

		// make sure vehicle does not exceed maximum speed

		if ( this.getSpeedSquared() > ( this.maxSpeed * this.maxSpeed ) ) {

			this.velocity.normalize();
			this.velocity.multiplyScalar( this.maxSpeed );

		}

		// calculate displacement

		displacement.copy( this.velocity ).multiplyScalar( delta );

		// calculate target position

		target.copy( this.position ).add( displacement );

		// update the orientation if the vehicle has a non zero velocity

		if ( this.updateOrientation && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target );

		}

		// update position

		this.position.copy( target );

	}

	getSpeed() {

		return this.velocity.length();

	}

	getSpeedSquared() {

		return this.velocity.squaredLength();

	}

}

export { MovingEntity };
