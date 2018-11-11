import { Ray } from '../../math/Ray.js';
import { Vector3 } from '../../math/Vector3.js';

const toPoint = new Vector3();
const direction = new Vector3();
const ray = new Ray();
const intersectionPoint = new Vector3();

/**
* Class for representing the vision component of a game entity.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Vision {

	/**
	* Constructs a new vision object.
	*
	* @param {GameEntity} owner - The owner of this vision instance.
	*/
	constructor( owner = null ) {

		/**
		* The game entity that owns this vision instance.
		* @type GameEntity
		*/
		this.owner = owner;

		/**
		* The field of view in radians.
		* @type Number
		* @default π/2
		*/
		this.fieldOfView = Math.PI;

		/**
		* The visual range in world units.
		* @type Number
		* @default Infinity
		*/
		this.range = Infinity;

		/**
		* An array of {@link Obstacle obstacles}.
		* @type Array
		*/
		this.obstacles = new Array();

	}

	/**
	* Adds an obstacle to this vision instance.
	*
	* @param {Obstacle} obstacle - The obstacle to add.
	* @return {Vision} A reference to this vision instance.
	*/
	addObstacle( obstacle ) {

		this.obstacles.push( obstacle );

		return this;

	}

	/**
	* Removes an obstacle from this vision instance.
	*
	* @param {Obstacle} obstacle - The obstacle to remove.
	* @return {Vision} A reference to this vision instance.
	*/
	removeObstacle( obstacle ) {

		const index = this.obstacles.indexOf( obstacle );
		this.obstacles.splice( index, 1 );

		return this;

	}

	/**
	* Performs a line of sight test in order to determine if the given point
	* in 3D space is visible for the game entity.
	*
	* @param {Vector3} point - The point to test.
	* @return {Boolean} Whether the given point is visible or not.
	*/
	visible( point ) {

		const owner = this.owner;
		const obstacles = this.obstacles;

		// check if point lies within the game entity's visual range

		toPoint.subVectors( point, owner.position );
		const distanceToPoint = toPoint.length();

		if ( distanceToPoint > this.range ) return false;

		// next, check if the point lies within the game entity's field of view

		owner.getDirection( direction );

		const angle = direction.angleTo( toPoint );

		if ( angle > ( this.fieldOfView * 0.5 ) ) return false;

		// the point lies within the game entity's visual range and field
		// of view. now check if obstacles block the game entity's view to the given point.

		ray.origin.copy( owner.position );
		ray.direction.copy( toPoint ).divideScalar( distanceToPoint || 1 ); // normalize

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstacle = obstacles[ i ];

			const intersection = obstacle.intersectRay( ray, intersectionPoint );

			if ( intersection !== null ) {

				// if an intersection point is closer to the game entity than the given point,
				// something is blocking the game entity's view

				const squaredDistanceToIntersectionPoint = intersectionPoint.squaredDistanceTo( owner.position );

				if ( squaredDistanceToIntersectionPoint <= ( distanceToPoint * distanceToPoint ) ) return false;

			}

		}

		return true;

	}

}

export { Vision };
