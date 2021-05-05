import { Vector3 } from './Vector3.js';

/**
* Implementation of a half-edge data structure, also known as
* {@link https://en.wikipedia.org/wiki/Doubly_connected_edge_list Doubly connected edge list}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class HalfEdge {

	/**
	* Constructs a new half-edge.
	*
	* @param {Vector3} vertex - The vertex of this half-edge. It represents the head/destination of the respective full edge.
	*/
	constructor( vertex = new Vector3() ) {

		/**
		* The vertex of this half-edge. It represents the head/destination of the respective full edge.
		* @type {Vector3}
		*/
		this.vertex = vertex;

		/**
		* A reference to the next half-edge.
		* @type {?HalfEdge}
		* @default null
		*/
		this.next = null;

		/**
		* A reference to the previous half-edge.
		* @type {?HalfEdge}
		* @default null
		*/
		this.prev = null;

		/**
		* A reference to the opponent half-edge.
		* @type {?HalfEdge}
		* @default null
		*/
		this.twin = null;

		/**
		* A reference to its polygon/face.
		* @type {?Polygon}
		* @default null
		*/
		this.polygon = null;

	}

	/**
	* Returns the tail of this half-edge. That's a reference to the previous
	* half-edge vertex.
	*
	* @return {Vector3} The tail vertex.
	*/
	tail() {

		return this.prev ? this.prev.vertex : null;

	}

	/**
	* Returns the head of this half-edge. That's a reference to the own vertex.
	*
	* @return {Vector3} The head vertex.
	*/
	head() {

		return this.vertex;

	}

	/**
	* Computes the length of this half-edge.
	*
	* @return {Number} The length of this half-edge.
	*/
	length() {

		const tail = this.tail();
		const head = this.head();

		if ( tail !== null ) {

			return tail.distanceTo( head );

		}

		return - 1;

	}

	/**
	* Computes the squared length of this half-edge.
	*
	* @return {Number} The squared length of this half-edge.
	*/
	squaredLength() {

		const tail = this.tail();
		const head = this.head();

		if ( tail !== null ) {

			return tail.squaredDistanceTo( head );

		}

		return - 1;

	}

	/**
	* Links the given opponent half edge with this one.
	*
	* @param {HalfEdge} edge - The opponent edge to link.
	* @return {HalfEdge} A reference to this half edge.
	*/
	linkOpponent( edge ) {

		this.twin = edge;
		edge.twin = this;

		return this;

	}

	/**
	* Computes the direction of this half edge. The method assumes the half edge
	* has a valid reference to a previous half edge.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getDirection( result ) {

		return result.subVectors( this.vertex, this.prev.vertex ).normalize();

	}

}

export { HalfEdge };
