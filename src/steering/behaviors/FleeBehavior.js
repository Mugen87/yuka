/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { Vector3 } from '../../Math/Vector3.js';

const desiredVelocity = new Vector3();

class FleeBehavior extends SteeringBehavior {

	constructor( target, panicDistance = 10 ) {

		super();

		this.target = target;
		this.panicDistance = panicDistance;

	}

	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// only flee if the target is within panic distance

		const distanceToTargetSq = vehicle.position.distanceToSquared( target );

		if ( distanceToTargetSq < ( this.panicDistance * this.panicDistance ) ) {

			// from here, the only difference compared to seek is that the desired
			// velocity is calculated using a vector pointing in the opposite direction

			desiredVelocity.subVectors( vehicle.position, target ).normalize();

			// if target and vehicle position are identical, choose default velocity

			if ( desiredVelocity.lengthSquared() === 0 ) {

				desiredVelocity.set( 0, 0, 1 );

			}

			desiredVelocity.multiplyScalar( vehicle.maxSpeed );

			force.subVectors( desiredVelocity, vehicle.velocity );

		}

	}

}

export { FleeBehavior };
