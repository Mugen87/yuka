import { Vector3 } from './Vector3.js';

const normal = new Vector3();
const oppositeNormal = new Vector3();
const directionA = new Vector3();
const directionB = new Vector3();

const c = new Vector3();
const d = new Vector3();
const v = new Vector3();

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
	* @param {Polyhedron} polyhedronA - The first convex polyhedron.
	* @param {Polyhedron} polyhedronB - The second convex polyhedron.
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

		const faces = polyhedronA.faces;

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			const plane = face.plane;

			oppositeNormal.copy( plane.normal ).multiplyScalar( - 1 );

			const supportVertex = this._getSupportVertex( polyhedronB, oppositeNormal );
			const distance = plane.distanceToPoint( supportVertex );

			if ( distance > 0 ) return true; // separating axis found

		}

		return false;

	}

	// check with possible separating axes computed via the cross product between
	// all edge combinations of both polyhedra

	_checkEdgeDirections( polyhedronA, polyhedronB ) {

		const edgesA = polyhedronA.edges;
		const edgesB = polyhedronB.edges;

		for ( let i = 0, il = edgesA.length; i < il; i ++ ) {

			const edgeA = edgesA[ i ];

			for ( let j = 0, jl = edgesB.length; j < jl; j ++ ) {

				const edgeB = edgesB[ j ];

				edgeA.getDirection( directionA );
				edgeB.getDirection( directionB );

				// edge pruning: only consider edges if they build a face on the minkowski difference

				if ( this._minkowskiFace( edgeA, directionA, edgeB, directionB ) ) {

					// compute axis

					const distance = this._distanceBetweenEdges( edgeA, directionA, edgeB, directionB, polyhedronA );

					if ( distance > 0 ) return true; // separating axis found

				}

			}

		}

		return false;

	}

	// return the most extreme vertex into a given direction

	_getSupportVertex( polyhedron, direction ) {

		let maxProjection = - Infinity;
		let supportVertex = null;

		// iterate over all polygons

		const vertices = polyhedron.vertices;

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			const vertex = vertices[ i ];
			const projection = vertex.dot( direction );

			// check vertex to find the best support point

			if ( projection > maxProjection ) {

				maxProjection = projection;
				supportVertex = vertex;

			}

		}

		return supportVertex;

	}

	// returns true if the given edges build a face on the minkowski difference

	_minkowskiFace( edgeA, directionA, edgeB, directionB ) {

		// get face normals which define the vertices of the arcs on the gauss map

		const a = edgeA.polygon.plane.normal;
		const b = edgeA.twin.polygon.plane.normal;
		c.copy( edgeB.polygon.plane.normal );
		d.copy( edgeB.twin.polygon.plane.normal );

		// negate normals c and d to account for minkowski difference

		c.multiplyScalar( - 1 );
		d.multiplyScalar( - 1 );

		// compute triple products

		// it's not necessary to compute the cross product since edges of convex polyhedron
		// have same direction as the cross product between their adjacent face normals

		const cba = c.dot( directionA );
		const dba = d.dot( directionA );
		const adc = a.dot( directionB );
		const bdc = b.dot( directionB );

		// check signs of plane test

		return ( ( cba * dba ) ) < 0 && ( ( adc * bdc ) < 0 ) && ( ( cba * bdc ) > 0 );

	}

	// use gauss map to compute the distance between two edges

	_distanceBetweenEdges( edgeA, directionA, edgeB, directionB, polyhedronA ) {

		// skip parallel edges

		if ( Math.abs( directionA.dot( directionB ) ) === 1 ) return - Infinity;

		// build plane through one edge

		normal.crossVectors( directionA, directionB ).normalize();

		// ensure normal points from polyhedron A to B

		if ( normal.dot( v.subVectors( edgeA.vertex, polyhedronA.centroid ) ) < 0 ) {

			normal.multiplyScalar( - 1 );

		}

		// compute the distance of any vertex on the other edge to that plane
		// no need to compute support points => O(1)

		return normal.dot( v.subVectors( edgeB.vertex, edgeA.vertex ) );

	}

}

export { SAT };
