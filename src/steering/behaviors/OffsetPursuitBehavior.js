import { SteeringBehavior } from '../SteeringBehavior.js';
import { ArriveBehavior } from './ArriveBehavior.js';
import { Vector3 } from '../../math/Vector3.js';

const offsetWorld = new Vector3();
const toOffset = new Vector3();
const newLeaderVelocity = new Vector3();
const predictedPosition = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle at a specified offset from a leader vehicle.
* Useful for creating formations.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class OffsetPursuitBehavior extends SteeringBehavior {

	/**
	* Constructs a new offset pursuit behavior.
	*
	* @param {Vehicle} leader - The leader vehicle.
	* @param {Vector3} offset - The offset from the leader.
	*/
	constructor( leader = null, offset = new Vector3() ) {

		super();

		/**
		* The leader vehicle.
		* @type {?Vehicle}
		* @default null
		*/
		this.leader = leader;

		/**
		* The offset from the leader.
		* @type {Vector3}
		*/
		this.offset = offset;

		// internal behaviors

		this._arrive = new ArriveBehavior();
		this._arrive.deceleration = 1.5;

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

		const leader = this.leader;
		const offset = this.offset;

		// calculate the offset's position in world space

		offsetWorld.copy( offset ).applyMatrix4( leader.worldMatrix );

		// calculate the vector that points from the vehicle to the offset position

		toOffset.subVectors( offsetWorld, vehicle.position );

		// the lookahead time is proportional to the distance between the leader
		// and the pursuer and is inversely proportional to the sum of both
		// agent's velocities

		const lookAheadTime = toOffset.length() / ( vehicle.maxSpeed + leader.getSpeed() );

		// calculate new velocity and predicted future position

		newLeaderVelocity.copy( leader.velocity ).multiplyScalar( lookAheadTime );

		predictedPosition.addVectors( offsetWorld, newLeaderVelocity );

		// now arrive at the predicted future position of the offset

		this._arrive.target = predictedPosition;
		this._arrive.calculate( vehicle, force );

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.leader = this.leader ? this.leader.uuid : null;
		json.offset = this.offset;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OffsetPursuitBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.leader = json.leader;
		this.offset = json.offset;

		return this;

	}


	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {OffsetPursuitBehavior} A reference to this behavior.
	*/
	resolveReferences( entities ) {

		this.leader = entities.get( this.leader ) || null;

	}

}

export { OffsetPursuitBehavior };
