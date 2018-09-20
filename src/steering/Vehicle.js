/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

import { MovingEntity } from '../core/MovingEntity.js';
import { SteeringManager } from './SteeringManager.js';
import { Vector3 } from '../math/Vector3.js';

const steeringForce = new Vector3();
const displacement = new Vector3();
const acceleration = new Vector3();
const target = new Vector3();
const velocitySmooth = new Vector3();

class Vehicle extends MovingEntity {

	constructor() {

		super();

		this.mass = 1;
		this.maxForce = 100; // the maximum force this entity can produce to power itself (think rockets and thrust)

		this.steering = new SteeringManager( this );

		this.smoother = null; // can be used to avoid shakiness due to conflicting steering behaviors

	}

	update( delta ) {

		// calculate steering force

		this.steering.calculate( delta, steeringForce );

		// acceleration = force / mass

		acceleration.copy( steeringForce ).divideScalar( this.mass );

		// update velocity

		this.velocity.add( acceleration.multiplyScalar( delta ) );

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

		if ( this.updateOrientation === true && this.smoother === null && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target );

		}

		// update position

		this.position.copy( target );

		// if smoothing is enabled, the orientation (not the position!) of the vehicle is
		// changed based on a post-processed velocity vector

		if ( this.updateOrientation === true && this.smoother !== null ) {

			this.smoother.update( this.velocity, velocitySmooth );

			displacement.copy( velocitySmooth ).multiplyScalar( delta );
			target.copy( this.position ).add( displacement );

			this.lookAt( target );

		}

	}

}

export { Vehicle };
