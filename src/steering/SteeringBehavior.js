/**
* Base class for all concrete steering behaviors. They produce a force that describes
* where an agent should move and how fast it should travel to get there.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SteeringBehavior {

	/**
	* Constructs a new steering behavior.
	*/
	constructor() {

		/**
		* Whether this steering behavior is active or not.
		* @type Boolean
		* @default true
		*/
		this.active = true;

		/**
		* Can be used to tweak the amount that a steering force contributes to the total steering force.
		* @type Number
		* @default 1
		*/
		this.weight = 1;

	}

	/**
	* Calculates the steering force for a single simulation step.
	*
	* @param {Vehicle} vehicle - The game entity the force is produced for.
	* @param {Vector3} force - The force/result vector.
	* @param {Number} delta - The time delta.
	* @return {Vector3} The force/result vector.
	*/
	calculate( /* vehicle, force, delta */ ) {}

}

export { SteeringBehavior };
