import { GameEntity } from './GameEntity.js';
import { Vector3 } from '../math/Vector3.js';

const displacement = new Vector3();
const target = new Vector3();

/**
* Class representing moving game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class MovingEntity extends GameEntity {

	/**
	* Constructs a new moving entity.
	*/
	constructor() {

		super();

		/**
		* The velocity of this game entity.
		* @type {Vector3}
		*/
		this.velocity = new Vector3();

		/**
		* The maximum speed at which this game entity may travel.
		* @type {Number}
		* @default 1
		*/
		this.maxSpeed = 1;

		/**
		* Whether the orientation of this game entity will be updated based on the velocity or not.
		* @type {Boolean}
		* @default true
		*/
		this.updateOrientation = true;

	}

	/**
	* Updates the internal state of this game entity.
	*
	* @param {Number} delta - The time delta.
	* @return {MovingEntity} A reference to this moving entity.
	*/
	update( delta ) {

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

		if ( this.updateOrientation && this.getSpeedSquared() > 0.00000001 ) {

			this.lookAt( target );

		}

		// update position

		this.position.copy( target );

		return this;

	}

	/**
	* Returns the current speed of this game entity.
	*
	* @return {Number} The current speed.
	*/
	getSpeed() {

		return this.velocity.length();

	}

	/**
	* Returns the current speed in squared space of this game entity.
	*
	* @return {Number} The current speed in squared space.
	*/
	getSpeedSquared() {

		return this.velocity.squaredLength();

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.velocity = this.velocity.toArray( new Array() );
		json.maxSpeed = this.maxSpeed;
		json.updateOrientation = this.updateOrientation;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MovingEntity} A reference to this moving entity.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.velocity.fromArray( json.velocity );
		this.maxSpeed = json.maxSpeed;
		this.updateOrientation = json.updateOrientation;

		return this;

	}

}

export { MovingEntity };
