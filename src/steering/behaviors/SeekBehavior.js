/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { SteeringBehavior } from '../SteeringBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const desiredVelocity = new Vector3();

class SeekBehavior extends SteeringBehavior {

	constructor( target ) {

		super();

		this.target = target;

	}

	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// First the desired velocity is calculated.
		// This is the velocity the agent would need to reach the target position in an ideal world.
		// It represents the vector from the agent to the target,
		// scaled to be the length of the maximum possible speed of the agent.

		desiredVelocity.subVectors( target, vehicle.position ).normalize();
		desiredVelocity.multiplyScalar( vehicle.maxSpeed );

		// The steering force returned by this method is the force required,
		// which when added to the agent’s current velocity vector gives the desired velocity.
		// To achieve this you simply subtract the agent’s current velocity from the desired velocity.

		force.subVectors( desiredVelocity, vehicle.velocity );

	}

}

export { SeekBehavior };
