import { Vector3 } from './Vector3.js';
import { MathUtils } from './MathUtils.js';

const p1 = new Vector3();
const p2 = new Vector3();

/**
* Class representing a 3D line segment.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class LineSegment {

	/**
	* Constructs a new line segment with the given values.
	*
	* @param {Vector3} from - The start point of the line segment.
	* @param {Vector3} to - The end point of the line segment.
	*/
	constructor( from = new Vector3(), to = new Vector3() ) {

		/**
		* The start point of the line segment.
		* @type {Vector3}
		*/
		this.from = from;

		/**
		* The end point of the line segment.
		* @type {Vector3}
		*/
		this.to = to;

	}

	/**
	* Sets the given values to this line segment.
	*
	* @param {Vector3} from - The start point of the line segment.
	* @param {Vector3} to - The end point of the line segment.
	* @return {LineSegment} A reference to this line segment.
	*/
	set( from, to ) {

		this.from = from;
		this.to = to;

		return this;

	}

	/**
	* Copies all values from the given line segment to this line segment.
	*
	* @param {LineSegment} lineSegment - The line segment to copy.
	* @return {LineSegment} A reference to this line segment.
	*/
	copy( lineSegment ) {

		this.from.copy( lineSegment.from );
		this.to.copy( lineSegment.to );

		return this;

	}

	/**
	* Creates a new line segment and copies all values from this line segment.
	*
	* @return {LineSegment} A new line segment.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the difference vector between the end and start point of this
	* line segment and stores the result in the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	delta( result ) {

		return result.subVectors( this.to, this.from );

	}

	/**
	* Computes a position on the line segment according to the given t value
	* and stores the result in the given 3D vector. The t value has usually a range of
	* [0, 1] where 0 means start position and 1 the end position.
	*
	* @param {Number} t - A scalar value representing a position on the line segment.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	at( t, result ) {

		return this.delta( result ).multiplyScalar( t ).add( this.from );

	}

	/**
	* Computes the closest point on an infinite line defined by the line segment.
	* It's possible to clamp the closest point so it does not exceed the start and
	* end position of the line segment.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Boolean} clampToLine - Indicates if the results should be clamped.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The closest point.
	*/
	closestPointToPoint( point, clampToLine, result ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.at( t, result );

	}

	/**
	* Computes a scalar value which represents the closest point on an infinite line
	* defined by the line segment. It's possible to clamp this value so it does not
	* exceed the start and end position of the line segment.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Boolean} clampToLine - Indicates if the results should be clamped.
	* @return {Number} A scalar representing the closest point.
	*/
	closestPointToPointParameter( point, clampToLine = true ) {

		p1.subVectors( point, this.from );
		p2.subVectors( this.to, this.from );

		const dotP2P2 = p2.dot( p2 );
		const dotP2P1 = p2.dot( p1 );

		let t = dotP2P1 / dotP2P2;

		if ( clampToLine ) t = MathUtils.clamp( t, 0, 1 );

		return t;

	}

	/**
	* Returns true if the given line segment is deep equal with this line segment.
	*
	* @param {LineSegment} lineSegment - The line segment to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( lineSegment ) {

		return lineSegment.from.equals( this.from ) && lineSegment.to.equals( this.to );

	}

}

export { LineSegment };
