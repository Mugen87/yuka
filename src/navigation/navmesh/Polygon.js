/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

import { HalfEdge } from './HalfEdge.js';
import { Plane } from '../../math/Plane.js';
import { Vector3 } from '../../math/Vector3.js';
import { Logger } from '../../core/Logger.js';
import { _Math } from '../../math/Math.js';

class Polygon {

	constructor() {

		this.centroid = new Vector3();
		this.edge = null;
		this.plane = new Plane();

	}

	fromContour( points ) {

		// create edges from points (assuming CCW order)

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

	getContour( result ) {

		let edge = this.edge;

		result.length = 0;

		do {

			result.push( edge.vertex );

			edge = edge.next;

		} while ( edge !== this.edge );

		return result;

	}

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

	return _Math.area( a, b, c ) >= 0;

}

export { Polygon };
