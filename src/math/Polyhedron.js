import { Vector3 } from './Vector3.js';

/**
* Base class for polyhedra.
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
		* @type Array
		*/
		this.faces = new Array();

		/**
		* A list of unique edges (no duplicate half edges).
		* @type Array
		*/
		this.edges = new Array();

		/**
		* The centroid of this polyhedron.
		* @type Vector3
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
	* Computes the edge list of this polyhedron. This list does not contain
	* duplicate half edges.
	*
	* @return {Polyhedron} A reference to this polyhedron.
	*/
	computeEdgeList() {

		const faces = this.faces;
		const edges = this.edges;

		edges.length = 0;

		// iterate over all faces

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];
			const firstEdge = face.edge;

			let edge = firstEdge;

			// process all edges of a faces

			do {

				// only add the edge if the twin was not added before

				if ( edges.includes( edge.twin ) === false ) {

					edges.push( edge );

				}

				edge = edge.next;

			} while ( edge !== firstEdge );

		}

		return this;

	}

}

export { Polyhedron };
