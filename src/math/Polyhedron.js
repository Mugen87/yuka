import { Vector3 } from './Vector3.js';
import { Polygon } from './Polygon.js';

/**
* Base class for polyhedra. It is primarily designed for the internal usage in Yuka.
* Objects of this class are always build up from faces. The edges, vertices and
* the polyhedron's centroid have to be derived from a valid face definition with the
* respective methods.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Polyhedron {

	/**
	* Constructs a new polyhedron.
	*/
	constructor() {

		/**
		* The faces of this polyhedron.
		* @type {Array<Polygon>}
		*/
		this.faces = new Array();

		/**
		* A list of unique edges (no opponent half edges).
		* @type {Array<HalfEdge>}
		*/
		this.edges = new Array();

		/**
		* A list of unique vertices.
		* @type {Array<Vector3>}
		*/
		this.vertices = new Array();

		/**
		* The centroid of this polyhedron.
		* @type {Vector3}
		*/
		this.centroid = new Vector3();

	}

	/**
	* Computes the centroid of this polyhedron. Assumes its faces
	* have valid centroids.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeCentroid() {

		const centroid = this.centroid;
		let faces = this.faces;

		centroid.set( 0, 0, 0 );

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			centroid.add( face.centroid );

		}

		centroid.divideScalar( faces.length );

		return this;

	}

	/**
	* Computes unique vertices of this polyhedron. Assumes {@link Polyhedron#faces}
	* is properly set.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeUniqueVertices() {

		const faces = this.faces;
		const vertices = this.vertices;

		vertices.length = 0;

		const uniqueVertices = new Set();

		// iterate over all faces

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			let edge = face.edge;

			// process all edges of a faces

			do {

				// add vertex to set (assuming half edges share unique vertices)

				uniqueVertices.add( edge.vertex );

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		vertices.push( ...uniqueVertices );

		return this;

	}

	/**
	* Computes unique edges of this polyhedron. Assumes {@link Polyhedron#faces}
	* is properly set.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeUniqueEdges() {

		const faces = this.faces;
		const edges = this.edges;

		edges.length = 0;

		// iterate over all faces

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			let edge = face.edge;

			// process all edges of a faces

			do {

				// only add the edge if the twin was not added before

				if ( edges.includes( edge.twin ) === false ) {

					edges.push( edge );

				}

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		return this;

	}

	/**
	* Configures this polyhedron so it does represent the given AABB.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	fromAABB( aabb ) {

		this.faces.length = 0;
		this.vertices.length = 0;

		const min = aabb.min;
		const max = aabb.max;

		const vertices = [
			new Vector3( max.x, max.y, max.z ),
			new Vector3( max.x, max.y, min.z ),
			new Vector3( max.x, min.y, max.z ),
			new Vector3( max.x, min.y, min.z ),
			new Vector3( min.x, max.y, max.z ),
			new Vector3( min.x, max.y, min.z ),
			new Vector3( min.x, min.y, max.z ),
			new Vector3( min.x, min.y, min.z )
		];

		this.vertices.push( ... vertices );

		const sideTop = new Polygon().fromContour( [
			vertices[ 4 ],
			vertices[ 0 ],
			vertices[ 1 ],
			vertices[ 5 ]
		] );

		const sideRight = new Polygon().fromContour( [
			vertices[ 2 ],
			vertices[ 3 ],
			vertices[ 1 ],
			vertices[ 0 ]
		] );

		const sideFront = new Polygon().fromContour( [
			vertices[ 6 ],
			vertices[ 2 ],
			vertices[ 0 ],
			vertices[ 4 ]
		] );

		const sideBack = new Polygon().fromContour( [
			vertices[ 3 ],
			vertices[ 7 ],
			vertices[ 5 ],
			vertices[ 1 ]
		] );

		const sideBottom = new Polygon().fromContour( [
			vertices[ 3 ],
			vertices[ 2 ],
			vertices[ 6 ],
			vertices[ 7 ]
		] );

		const sideLeft = new Polygon().fromContour( [
			vertices[ 7 ],
			vertices[ 6 ],
			vertices[ 4 ],
			vertices[ 5 ]
		] );

		// link edges

		sideTop.edge.linkOpponent( sideLeft.edge.prev );
		sideTop.edge.next.linkOpponent( sideFront.edge.prev );
		sideTop.edge.next.next.linkOpponent( sideRight.edge.prev );
		sideTop.edge.prev.linkOpponent( sideBack.edge.prev );

		sideBottom.edge.linkOpponent( sideBack.edge.next );
		sideBottom.edge.next.linkOpponent( sideRight.edge.next );
		sideBottom.edge.next.next.linkOpponent( sideFront.edge.next );
		sideBottom.edge.prev.linkOpponent( sideLeft.edge.next );

		sideLeft.edge.linkOpponent( sideBack.edge.next.next );
		sideBack.edge.linkOpponent( sideRight.edge.next.next );
		sideRight.edge.linkOpponent( sideFront.edge.next.next );
		sideFront.edge.linkOpponent( sideLeft.edge.next.next );

		//

		this.faces.push( sideTop, sideRight, sideFront, sideBack, sideBottom, sideLeft );

		// compute centroids

		sideTop.computeCentroid();
		sideRight.computeCentroid();
		sideFront.computeCentroid();
		sideBack.computeCentroid();
		sideBottom.computeCentroid();
		sideLeft.computeCentroid();

		aabb.getCenter( this.centroid );

		//

		this.computeUniqueEdges();

		return this;

	}

}

export { Polyhedron };
