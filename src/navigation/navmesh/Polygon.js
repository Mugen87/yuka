import { HalfEdge } from './HalfEdge.js';
import { Plane } from '../../math/Plane.js';
import { Vector3 } from '../../math/Vector3.js';
import { Logger } from '../../core/Logger.js';
import { MathUtils } from '../../math/MathUtils.js';

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
		* @type Vector3
		*/
		this.centroid = new Vector3();

		/**
		* A reference to the first half-edge of this polygon.
		* @type HalfEdge
		*/
		this.edge = null;

		/**
		* A plane abstraction of this polygon.
		* @type Plane
		*/
		this.plane = new Plane();

	}

	/**
	* Creates the polygon based on the given array of points in 3D space.
	* The method assumes the contour (the sequence of points) is defined
	* in CCW order.
	*
	* @param {Array} points - The array of points.
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

			if ( i === 0 ) {

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

			centroid.add( edge.from() );

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

			const v1 = edge.from();
			const v2 = edge.to();

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
	* @return {Boolean} Whether this polygon is convex or not.
	*/
	convex() {

		let edge = this.edge;

		do {

			const v1 = edge.from();
			const v2 = edge.to();
			const v3 = edge.next.to();

			if ( leftOn( v1, v2, v3 ) === false ) {

				return false;

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

			const distance = plane.distanceToPoint( edge.from() );

			if ( Math.abs( distance ) > epsilon ) {

				return false;

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		return true;

	}

	/**
	* Determines the contour (sequence of points) of this polygon and
	* stores the result in the given array.
	*
	* @param {Array} result - The result array.
	* @return {Array} The result array.
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

	/**
	* Determines the portal edge that can be used to reach the
	* given polygon over its twin reference. The result is stored
	* in the given portal edge data structure. If the given polygon
	* is no direct neighbor, the references of the portal edge data
	* structure are set to null.
	*
	* @param {Polygon} polygon - The polygon to reach.
	* @param {Object} portalEdge - The portal edge.
	* @return {Object} The portal edge.
	*/
	getPortalEdgeTo( polygon, portalEdge ) {

		let edge = this.edge;

		do {

			if ( edge.twin !== null ) {

				if ( edge.twin.polygon === polygon ) {

					portalEdge.left = edge.vertex;
					portalEdge.right = edge.next.vertex;
					return portalEdge;

				}

			}

			edge = edge.next;

		} while ( edge !== this.edge );

		portalEdge.left = null;
		portalEdge.right = null;

		return portalEdge;

	}

}

// from the book "Computational Geometry in C, Joseph O'Rourke"

function leftOn( a, b, c ) {

	return MathUtils.area( a, b, c ) >= 0;

}

export { Polygon };
