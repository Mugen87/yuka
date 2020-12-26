import { SteeringBehavior } from '../SteeringBehavior.js';
import { Path } from '../Path.js';
import { Vector3 } from '../../math/Vector3.js';
import { LineSegment } from '../../math/LineSegment.js';
import { SeekBehavior } from './SeekBehavior.js';

const translation = new Vector3();
const predictedPosition = new Vector3();
const normalPoint = new Vector3();
const lineSegment = new LineSegment();
const closestNormalPoint = new Vector3();

/**
* This steering behavior produces a force that keeps a vehicle close to its path. It is intended
* to use it in combination with {@link FollowPathBehavior} in order to realize a more strict path following.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments SteeringBehavior
*/
class OnPathBehavior extends SteeringBehavior {

	/**
	* Constructs a new on path behavior.
	*
	* @param {Path} path - The path to stay close to.
	* @param {Number} radius - Defines the width of the path. With a smaller radius, the vehicle will have to follow the path more closely.
	* @param {Number} predictionFactor - Determines how far the behavior predicts the movement of the vehicle.
	*/
	constructor( path = new Path(), radius = 0.1, predictionFactor = 1 ) {

		super();

		/**
		* The path to stay close to.
		* @type {Path}
		*/
		this.path = path;

		/**
		* Defines the width of the path. With a smaller radius, the vehicle will have to follow the path more closely.
		* @type {Number}
		* @default 0.1
		*/
		this.radius = radius;

		/**
		* Determines how far the behavior predicts the movement of the vehicle.
		* @type {Number}
		* @default 1
		*/
		this.predictionFactor = predictionFactor;

		// internal behaviors

		this._seek = new SeekBehavior();

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

		const path = this.path;

		// predicted future position

		translation.copy( vehicle.velocity ).multiplyScalar( this.predictionFactor );
		predictedPosition.addVectors( vehicle.position, translation );

		// compute closest line segment and normal point. the normal point is computed by projecting
		// the predicted position of the vehicle on a line segment.

		let minDistance = Infinity;

		let l = path._waypoints.length;

		// handle looped paths differently since they have one line segment more

		l = ( path.loop === true ) ? l : l - 1;

		for ( let i = 0; i < l; i ++ ) {

			lineSegment.from = path._waypoints[ i ];

			// the last waypoint needs to be handled differently for a looped path.
			// connect the last point with the first one in order to create the last line segment

			if ( path.loop === true && i === ( l - 1 ) ) {

				lineSegment.to = path._waypoints[ 0 ];

			} else {

				lineSegment.to = path._waypoints[ i + 1 ];

			}

			lineSegment.closestPointToPoint( predictedPosition, true, normalPoint );

			const distance = predictedPosition.squaredDistanceTo( normalPoint );

			if ( distance < minDistance ) {

				minDistance = distance;
				closestNormalPoint.copy( normalPoint );

			}

		}

		// seek towards the projected point on the closest line segment if
		// the predicted position of the vehicle is outside the valid range.
		// also ensure that the path length is greater than zero when performing a seek

		if ( minDistance > ( this.radius * this.radius ) && path._waypoints.length > 1 ) {

			this._seek.target = closestNormalPoint;
			this._seek.calculate( vehicle, force );

		}

		return force;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.path = this.path.toJSON();
		json.radius = this.radius;
		json.predictionFactor = this.predictionFactor;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OnPathBehavior} A reference to this behavior.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.path.fromJSON( json.path );
		this.radius = json.radius;
		this.predictionFactor = json.predictionFactor;

		return this;

	}

}

export { OnPathBehavior };
