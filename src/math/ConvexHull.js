import { Logger } from '../core/Logger.js';
import { Polygon } from '../navigation/navmesh/Polygon.js';
import { HalfEdge } from '../navigation/navmesh/HalfEdge.js';

/**
* Class representing a convex hull.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class ConvexHull {

	constructor() {

		this.faces = [];
		this.vertices = [];

		//

		this._tolerance = - 1;

		this._assigned = new VertexList();
		this._unassigned = new VertexList();

		this._newFaces = [];

	}

	fromPoints( points ) {

		if ( points.length < 4 ) {

			Logger.error( 'YUKA.ConvexHull: The given points array needs at least four points' );
			return this;

		}

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			this.vertices.push( new Vertex( points[ i ] ) );

		}

		this._generate();

		return this;

	}

	makeEmpty() {

		this.faces = [];
		this.vertices = [];

		return this;

	}

	// private API

	_generate() {

		return this;

	}

}

class Face extends Polygon {

	constructor( a, b, c ) {

		const edge0 = new HalfEdge( a, this );
		const edge1 = new HalfEdge( b, this );
		const edge2 = new HalfEdge( c, this );

		// join edges

		edge0.next = edge2.prev = edge1;
		edge1.next = edge0.prev = edge2;
		edge2.next = edge1.prev = edge0;

		// main half edge reference

		this.edge = edge0;

		//

		this.computeCentroid();

	}

}

// special data structures for the quick hull implementation

class Vertex {

	constructor( point ) {

		this.point = point;
		this.prev = null;
		this.next = null;
		this.face = null; // the face that is able to see this vertex

	}

}

class VertexList {

	constructor() {

		this.head = null;
		this.tail = null;

	}

	first() {

		return this.head;

	}

	last() {

		return this.tail;

	}

	clear() {

		this.head = this.tail = null;

		return this;

	}

	insertBefore( target, vertex ) {

		vertex.prev = target.prev;
		vertex.next = target;

		if ( vertex.prev === null ) {

			this.head = vertex;

		} else {

			vertex.prev.next = vertex;

		}

		target.prev = vertex;

		return this;

	}

	append( vertex ) {

		if ( this.head === null ) {

			this.head = vertex;

		} else {

			this.tail.next = vertex;

		}

		vertex.prev = this.tail;
		vertex.next = null; // the tail has no subsequent vertex

		this.tail = vertex;

		return this;

	}

	appendChain( vertex ) {

		if ( this.head === null ) {

			this.head = vertex;

		} else {

			this.tail.next = vertex;

		}

		vertex.prev = this.tail;

		while ( vertex.next !== null ) {

			vertex = vertex.next;

		}

		this.tail = vertex;

		return this;

	}

	remove( vertex ) {

		if ( vertex.prev === null ) {

			this.head = vertex.next;

		} else {

			vertex.prev.next = vertex.next;

		}

		if ( vertex.next === null ) {

			this.tail = vertex.prev;

		} else {

			vertex.next.prev = vertex.prev;

		}

		return this;

	}

	removeSubList( a, b ) {

		if ( a.prev === null ) {

			this.head = b.next;

		} else {

			a.prev.next = b.next;

		}

		if ( b.next === null ) {

			this.tail = a.prev;

		} else {

			b.next.prev = a.prev;

		}

		return this;

	}

	empty() {

		return this.head === null;

	}

}

export { ConvexHull };
