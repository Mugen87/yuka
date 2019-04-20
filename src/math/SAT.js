import { Vector3 } from './Vector3.js';

const oppositeNormal = new Vector3();
const axis = new Vector3();
const directionA = new Vector3();
const directionB = new Vector3();

const c = new Vector3();
const d = new Vector3();
const bxa = new Vector3();
const dxc = new Vector3();

/**
* Implementation of the separating axis theorem (SAT). Used to detect intersections
* between convex polyhedra. The code is based on the presentation {@link http://twvideo01.ubm-us.net/o1/vault/gdc2013/slides/822403Gregorius_Dirk_TheSeparatingAxisTest.pdf The Separating Axis Test between convex polyhedra}
* by Dirk Gregorius (Valve Software) from GDC 2013.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class SAT {

	/**
	* Returns true if the given convex polyhedra intersect. A polyhedron is just
	* an array of {@link Polygon} objects.
	*
	* @param {Array} polyhedronA - The first convex polyhedron.
	* @param {Array} polyhedronB - The second convex polyhedron.
	* @return {Boolean} Whether there is an intersection or not.
	*/
	intersects( polyhedronA, polyhedronB ) {

		const resultAB = this._checkFaceDirections( polyhedronA, polyhedronB );

		if ( resultAB ) return false;

		const resultBA = this._checkFaceDirections( polyhedronB, polyhedronA );

		if ( resultBA ) return false;

		const resultEdges = this._checkEdgeDirections( polyhedronA, polyhedronB );

		if ( resultEdges ) return false;

		// no separating axis found, the polyhedra must intersect

		return true;

	}

	// check possible separating axes from the first given polyhedron. the axes
	// are derived from the respective face normals

	_checkFaceDirections( polyhedronA, polyhedronB ) {

		for ( let i = 0, l = polyhedronA.length; i < l; i ++ ) {

			const polygon = polyhedronA[ i ];
			const plane = polygon.plane;

			oppositeNormal.copy( plane.normal ).multiplyScalar( - 1 );

			const supportVertex = this._getSupportVertex( polyhedronB, oppositeNormal );
			const distance = plane.distanceToPoint( supportVertex );

			if ( distance > 0 ) return true; // separating axis found

		}

		return false;

	}

	// check with possible separating axes computed with the cross product between
	// all edge combinations of both polyhedra

	_checkEdgeDirections( polyhedronA, polyhedronB ) {

		// iterate over all polygons of polyhedron A

		for ( let i = 0, l = polyhedronA.length; i < l; i ++ ) {

			const polygonA = polyhedronA[ i ];
			let edgeA = polygonA.edge;

			// iterate over all edges of A's current polygon

			do {

				// iterate over all polygons of polyhedron B

				for ( let i = 0, l = polyhedronB.length; i < l; i ++ ) {

					const polygonB = polyhedronB[ i ];
					let edgeB = polygonB.edge;

					// iterate over all edges of B's current polygon

					do {

						// edge pruning: only consider edges if they build a face on the minkowski difference

						if ( this._minkowskiFace( edgeA, edgeB ) ) {

							// compute axis

							edgeA.getDirection( directionA );
							edgeB.getDirection( directionB );

							axis.crossVectors( directionA, directionB );

							this._projectOnAxis( polyhedronA, axis, intervalA );
							this._projectOnAxis( polyhedronB, axis, intervalB );

							// compare intervals

							if ( ( intervalA.min <= intervalB.max && intervalB.min <= intervalA.max ) === false ) {

								return true; // intervals do not intersect, separating axis found

							}

						}

						edgeB = edgeB.next;

					} while ( edgeB !== polygonB.edge );

				}

				edgeA = edgeA.next;

			} while ( edgeA !== polygonA.edge );

		}

		return false;

	}

	// return the most extreme vertex into a given direction

	_getSupportVertex( polyhedron, direction ) {

		let maxProjection = - Infinity;
		let supportVertex = null;

		// iterate over all polygons

		for ( let i = 0, l = polyhedron.length; i < l; i ++ ) {

			const polygon = polyhedron[ i ];
			let edge = polygon.edge;

			// iterate over all edges

			do {

				const vertex = edge.vertex;
				const projection = vertex.dot( direction );

				// check vertex to find the best support point

				if ( projection > maxProjection ) {

					maxProjection = projection;
					supportVertex = vertex;

				}

				edge = edge.next;

			} while ( edge !== polygon.edge );

		}

		return supportVertex;

	}

	// projects all vertices of a polyhedron on the given axis and stores
	// the minimum and maximum projections in the given interval object

	_projectOnAxis( polyhedron, axis, interval ) {

		interval.reset();

		// iterate over all polygons

		for ( let i = 0, l = polyhedron.length; i < l; i ++ ) {

			const polygon = polyhedron[ i ];
			let edge = polygon.edge;

			// iterate over all edges

			do {

				const vertex = edge.vertex;
				const projection = vertex.dot( axis );

				interval.min = Math.min( interval.min, projection );
				interval.max = Math.max( interval.max, projection );

				edge = edge.next;

			} while ( edge !== polygon.edge );

		}

		return this;

	}

	// returns true if the given edges build a face on the minkowski difference

	_minkowskiFace( edgeA, edgeB ) {

		// get face normals which define the vertices of the arcs on the gauss map

		const a = edgeA.polygon.plane.normal;
		const b = edgeA.twin.polygon.plane.normal;
		c.copy( edgeB.polygon.plane.normal );
		d.copy( edgeB.twin.polygon.plane.normal );

		// negate normals c and d to account for minkowski difference

		c.multiplyScalar( - 1 );
		d.multiplyScalar( - 1 );

		// compute triple products

		bxa.crossVectors( b, a );
		dxc.crossVectors( d, c );

		const cba = c.dot( bxa );
		const dba = d.dot( bxa );
		const adc = a.dot( dxc );
		const bdc = b.dot( dxc );

		// check signs of plane test

		return ( ( cba * dba ) ) < 0 && ( ( adc * bdc ) < 0 ) && ( ( cba * bdc ) > 0 );

	}

}

// private helper class representing a scalar interval

class Interval {

	constructor() {

		this.min = Infinity;
		this.max = - Infinity;

	}

	reset() {

		this.min = Infinity;
		this.max = - Infinity;

	}

}

const intervalA = new Interval();
const intervalB = new Interval();

export { SAT };
