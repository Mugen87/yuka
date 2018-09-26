import { SteeringBehavior } from '../SteeringBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const desiredVelocity = new Vector3();
const displacement = new Vector3();

/**
* This steering behavior produces a force that directs an agent toward a target position.
* Unlike {@link SeekBehavior}, it decelerates so the agent comes to a gentle halt at the target position.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class ArriveBehavior extends SteeringBehavior {

	/**
	* Constructs a new arrive behavior.
	*
	* @param {Vector3} target - The target vector.
	* @param {Number} deceleration - The amount of deceleration.
	*/
	constructor( target = new Vector3(), deceleration = 3 ) {

		super();

		/**
		* The target vector.
		* @type Vector3
		*/
		this.target = target;

		/**
		* The amount of deceleration.
		* @type Number
		* @default 3
		*/
		this.deceleration = deceleration;

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

		return force;

	}

}

export { ArriveBehavior };
