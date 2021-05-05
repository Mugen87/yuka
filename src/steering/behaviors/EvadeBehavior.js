import { SteeringBehavior } from '../SteeringBehavior.js';
import { FleeBehavior } from './FleeBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const displacement = new Vector3();
const newPursuerVelocity = new Vector3();
const predictedPosition = new Vector3();

/**
* This steering behavior is is almost the same as {@link PursuitBehavior} except that
* the agent flees from the estimated future position of the pursuer.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class EvadeBehavior extends SteeringBehavior {

	/**
	* Constructs a new evade behavior.
	*
	* @param {MovingEntity} pursuer - The agent to evade from.
	* @param {Number} panicDistance - The agent only flees from the pursuer if it is inside this radius.
	* @param {Number} predictionFactor - This factor determines how far the vehicle predicts the movement of the pursuer.
	*/
	constructor( pursuer = null, panicDistance = 10, predictionFactor = 1 ) {

		super();

		/**
		* The agent to evade from.
		* @type {?MovingEntity}
		* @default null
		*/
		this.pursuer = pursuer;

		/**
		* The agent only flees from the pursuer if it is inside this radius.
		* @type {Number}
		* @default 10
		*/
		this.panicDistance = panicDistance;

		/**
		* This factor determines how far the vehicle predicts the movement of the pursuer.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._flee = new FleeBehavior();

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

		const pursuer = this.pursuer;

		displacement.subVectors( pursuer.position, vehicle.position );

		let lookAheadTime = displacement.length() / ( vehicle.maxSpeed + pursuer.getSpeed() );
		lookAheadTime *= this.predictionFactor; // tweak the magnitude of the prediction

		// calculate new velocity and predicted future position

		newPursuerVelocity.copy( pursuer.velocity ).multiplyScalar( lookAheadTime );
		predictedPosition.addVectors( pursuer.position, newPursuerVelocity );

		// now flee away from predicted future position of the pursuer

		this._flee.target = predictedPosition;
		this._flee.panicDistance = this.panicDistance;
		this._flee.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.pursuer = this.pursuer ? this.pursuer.uuid : null;
		json.panicDistance = this.panicDistance;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {EvadeBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.pursuer = json.pursuer;
		this.panicDistance = json.panicDistance;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {EvadeBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.pursuer = entities.get( this.pursuer ) || null;

	}

}

export { EvadeBehavior };
