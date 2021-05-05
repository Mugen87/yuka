import { Edge } from '../core/Edge.js';

/**
* Implementation of Depth-first Search.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class DFS {

	/**
	* Constructs a DFS algorithm object.
	*
	* @param {Graph} graph - The graph.
	* @param {Number} source - The node index of the source node.
	* @param {Number} target - The node index of the target node.
	*/
	constructor( graph = null, source = - 1, target = - 1 ) {

		/**
		* The graph.
		* @type {?Graph}
		* @default null
		*/
		this.graph = graph;

		/**
		* The node index of the source node.
		* @type {Number}
		* @default - 1
		*/
		this.source = source;

		/**
		* The node index of the target node.
		* @type {Number}
		* @default - 1
		*/
		this.target = target;

		/**
		* Whether the search was successful or not.
		* @type {Boolean}
		* @default false
		*/
		this.found = false;

		this._route = new Map(); // this holds the route taken to the target
		this._visited = new Set(); // holds the visited nodes

		this._spanningTree = new Set(); // for debugging purposes

	}

	/**
	* Executes the graph search. If the search was successful, {@link DFS#found}
	* is set to true.
	*
	* @return {DFS} A reference to this DFS object.
	*/
	search() {

		// create a stack(LIFO) of edges, done via an array

		const stack = new Array();
		const outgoingEdges = new Array();

		// create a dummy edge and put on the stack to begin the search

		const startEdge = new Edge( this.source, this.source );

		stack.push( startEdge );

		// while there are edges in the stack keep searching

		while ( stack.length > 0 ) {

			// grab the next edge and remove it from the stack

			const nextEdge = stack.pop();

			// make a note of the parent of the node this edge points to

			this._route.set( nextEdge.to, nextEdge.from );

			// and mark it visited

			this._visited.add( nextEdge.to );

			// expand spanning tree

			if ( nextEdge !== startEdge ) {

				this._spanningTree.add( nextEdge );

			}

			// if the target has been found the method can return success

			if ( nextEdge.to === this.target ) {

				this.found = true;

				return this;

			}

			// determine outgoing edges

			this.graph.getEdgesOfNode( nextEdge.to, outgoingEdges );

			// push the edges leading from the node this edge points to onto the
			// stack (provided the edge does not point to a previously visited node)

			for ( let i = 0, l = outgoingEdges.length; i < l; i ++ ) {

				const edge = outgoingEdges[ i ];

				if ( this._visited.has( edge.to ) === false ) {

					stack.push( edge );

				}

			}

		}

		this.found = false;

		return this;

	}

	/**
	* Returns the shortest path from the source to the target node as an array of node indices.
	*
	* @return {Array<Number>} The shortest path.
	*/
	getPath() {

		// array of node indices that comprise the shortest path from the source to the target

		const path = new Array();

		// just return an empty path if no path to target found or if no target has been specified

		if ( this.found === false || this.target === - 1 ) return path;

		// start with the target of the path

		let currentNode = this.target;

		path.push( currentNode );

		// while the current node is not the source node keep processing

		while ( currentNode !== this.source ) {

			// determine the parent of the current node

			currentNode = this._route.get( currentNode );

			// push the new current node at the beginning of the array

			path.unshift( currentNode );

		}

		return path;

	}

	/**
	* Returns the search tree of the algorithm as an array of edges.
	*
	* @return {Array<Edge>} The search tree.
	*/
	getSearchTree() {

		return [ ...this._spanningTree ];

	}

	/**
	* Clears the internal state of the object. A new search is now possible.
	*
	* @return {DFS} A reference to this DFS object.
	*/
	clear() {

		this.found = false;

		this._route.clear();
		this._visited.clear();
		this._spanningTree.clear();

		return this;

	}

}

export { DFS };
