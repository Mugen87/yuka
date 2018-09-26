import { SteeringBehavior } from '../SteeringBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const desiredVelocity = new Vector3();

/**
* This steering behavior produces a force that steers an agent away from a target position.
* It's the opposite of {@link SeekBehavior}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class FleeBehavior extends SteeringBehavior {

	/**
	* Constructs a new flee behavior.
	*
	* @param {Vector3} target - The target vector.
	* @param {Number} panicDistance - The agent only flees from the target if it is inside this radius.
	*/
	constructor( target = new Vector3(), panicDistance = 10 ) {

		super();

		/**
		* The target vector.
		* @type Vector3
		*/
		this.target = target;

		/**
		* The agent only flees from the target if it is inside this radius.
		* @type Number
		* @default 10
		*/
		this.panicDistance = panicDistance;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( vehicle, force /*, delta */ ) {

		const target = this.target;

		// only flee if the target is within panic distance

		const distanceToTargetSq = vehicle.position.squaredDistanceTo( target );

		if ( distanceToTargetSq <= ( this.panicDistance * this.panicDistance ) ) {

			// from here, the only difference compared to seek is that the desired
			// velocity is calculated using a vector pointing in the opposite direction

			desiredVelocity.subVectors( vehicle.position, target ).normalize();

			// if target and vehicle position are identical, choose default velocity

			if ( desiredVelocity.squaredLength() === 0 ) {

				desiredVelocity.set( 0, 0, 1 );

			}

			desiredVelocity.multiplyScalar( vehicle.maxSpeed );

			force.subVectors( desiredVelocity, vehicle.velocity );

		}

		return force;

	}

}

export { FleeBehavior };
