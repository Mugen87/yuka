import { HalfEdge } from './HalfEdge.js';
import { Plane } from './Plane.js';
import { Vector3 } from './Vector3.js';
import { MathUtils } from './MathUtils.js';
import { Logger } from '../core/Logger.js';

/**
* Class for representing a planar polygon with an arbitrary amount of edges.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Polygon {

	/**
	* Constructs a new polygon.
	*/
	constructor() {

		/**
		* The centroid of this polygon.
		* @type {Vector3}
		*/
		this.centroid = new Vector3();

		/**
		* A reference to the first half-edge of this polygon.
		* @type {?HalfEdge}
		* @default null
		*/
		this.edge = null;

		/**
		* A plane abstraction of this polygon.
		* @type {Plane}
		*/
		this.plane = new Plane();

	}

	/**
	* Creates the polygon based on the given array of points in 3D space.
	* The method assumes the contour (the sequence of points) is defined
	* in CCW order.
	*
	* @param {Array<Vector3>} points - The array of points.
	* @return {Polygon} A reference to this polygon.
	*/
	fromContour( points ) {

		const edges = new Array();

		if ( points.length < 3 ) {

			Logger.error( 'YUKA.Polygon: Unable to create polygon from contour. It needs at least three points.' );
			return this;

		}

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const edge = new HalfEdge( points[ i ] );
			edges.push( edge );

		}

		// link edges

		for ( let i = 0, l = edges.length; i < l; i ++ ) {

			let current, prev, next;

			if ( i === 0 ) {

				current = edges[ i ];
				prev = edges[ l - 1 ];
			 	next = edges[ i + 1 ];

			} else if ( i === ( l - 1 ) ) {

				current = edges[ i ];
			 	prev = edges[ i - 1 ];
				next = edges[ 0 ];

			} else {

			 	current = edges[ i ];
				prev = edges[ i - 1 ];
				next = edges[ i + 1 ];

			}

			current.prev = prev;
			current.next = next;
			current.polygon = this;

		}

		//

		this.edge = edges[ 0 ];

		//

		this.plane.fromCoplanarPoints( points[ 0 ], points[ 1 ], points[ 2 ] );

		return this;

	}

	/**
	* Computes the centroid for this polygon.
	*
	* @return {Polygon} A reference to this polygon.
	*/
	computeCentroid() {

		const centroid = this.centroid;
		let edge = this.edge;
		let count = 0;

		centroid.set( 0, 0, 0 );

		do {

			centroid.add( edge.vertex );

			count ++;

			edge = edge.next;

		} while ( edge !== this.edge );

		centroid.divideScalar( count );

		return this;

	}

	/**
	* Returns true if the polygon contains the given point.
	*
	* @param {Vector3} point - The point to test.
	* @param {Number} epsilon - A tolerance value.
	* @return {Boolean} Whether this polygon contain the given point or not.
	*/
	contains( point, epsilon = 1e-3 ) {

		const plane = this.plane;
		let edge = this.edge;

		// convex test

		do {

			const v1 = edge.tail();
			const v2 = edge.head();

			if ( leftOn( v1, v2, point ) === false ) {

				return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		// ensure the given point lies within a defined tolerance range

		const distance = plane.distanceToPoint( point );

		if ( Math.abs( distance ) > epsilon ) {

			return false;

		}

		return true;

	}

	/**
	* Returns true if the polygon is convex.
	*
	* @param {Boolean} ccw - Whether the winding order is CCW or not.
	* @return {Boolean} Whether this polygon is convex or not.
	*/
	convex( ccw = true ) {

		let edge = this.edge;

		do {

			const v1 = edge.tail();
			const v2 = edge.head();
			const v3 = edge.next.head();

			if ( ccw ) {

				if ( leftOn( v1, v2, v3 ) === false )	return false;

			} else {

				if ( leftOn( v3, v2, v1 ) === false ) return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		return true;

	}

	/**
	* Returns true if the polygon is coplanar.
	*
	* @param {Number} epsilon - A tolerance value.
	* @return {Boolean} Whether this polygon is coplanar or not.
	*/
	coplanar( epsilon = 1e-3 ) {

		const plane = this.plane;
		let edge = this.edge;

		do {

			const distance = plane.distanceToPoint( edge.vertex );

			if ( Math.abs( distance ) > epsilon ) {

				return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		return true;

	}

	/**
	* Computes the signed distance from the given 3D vector to this polygon. The method
	* uses the polygon's plane abstraction in order to compute this value.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Number} The signed distance from the given point to this polygon.
	*/
	distanceToPoint( point ) {

		return this.plane.distanceToPoint( point );

	}

	/**
	* Determines the contour (sequence of points) of this polygon and
	* stores the result in the given array.
	*
	* @param {Array<Vector3>} result - The result array.
	* @return {Array<Vector3>} The result array.
	*/
	getContour( result ) {

		let edge = this.edge;

		result.length = 0;

		do {

			result.push( edge.vertex );

			edge = edge.next;

		} while ( edge !== this.edge );

		return result;

	}

}

// from the book "Computational Geometry in C, Joseph O'Rourke"

function leftOn( a, b, c ) {

	return MathUtils.area( a, b, c ) >= 0;

}

export { Polygon };
