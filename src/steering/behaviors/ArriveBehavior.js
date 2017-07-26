/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior';
import { Vector3 } from '../../Math/Vector3';

class ArriveBehavior extends SteeringBehavior {

	constructor ( target, deceleration = 3 ) {

		super();

		this.target = target;
		this.deceleration = deceleration;

	}

}

Object.assign( ArriveBehavior.prototype, {

	calculate: function () {

		const desiredVelocity = new Vector3();
		const displacement = new Vector3();

		return function calculate ( vehicle, force ) {

			const target = this.target;
			const deceleration = this.deceleration;

			displacement.subVectors( target, vehicle.position );

			const distance = displacement.length();

			if ( distance > 0 ) {

				// calculate the speed required to reach the target given the desired deceleration

				let speed = distance / deceleration;

				// make sure the speed does not exceed the max

				speed = Math.min( speed, vehicle.maxSpeed );

				// from here proceed just like "seek" except we don't need to normalize
				// the "displacement" vector because we have already gone to the trouble
				// of calculating its length.

				desiredVelocity.copy( displacement ).multiplyScalar( speed / distance );

				force.subVectors( desiredVelocity, vehicle.velocity );

			}

		};

	} ()

} );

export { ArriveBehavior };
