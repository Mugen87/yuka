/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from './GameEntity';
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

	getSpeed () {

		return this.velocity.length();

	}

	getSpeedSquared () {

		return this.velocity.lengthSquared();

	}

}

export { MovingEntity };
