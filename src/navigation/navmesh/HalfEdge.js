/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * https://en.wikipedia.org/wiki/Doubly_connected_edge_list
 *
 */

import { Vector3 } from '../../math/Vector3.js';

class HalfEdge {

	constructor( vertex = new Vector3() ) {

		this.vertex = vertex;
		this.next = null;
		this.prev = null;
		this.twin = null;
		this.polygon = null;

		this.nodeIndex = - 1;

	}

	from() {

		return this.vertex;

	}

	to() {

		return this.next ? this.next.vertex : null;

	}

	length() {

		const from = this.from();
		const to = this.to();

		if ( to !== null ) {

			return from.distanceTo( to );

		}

		return - 1;

	}

	squaredLength() {

		const from = this.from();
		const to = this.to();

		if ( to !== null ) {

			return from.squaredDistanceTo( to );

		}

		return - 1;

	}

}

export { HalfEdge };
