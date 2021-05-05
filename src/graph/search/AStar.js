import { PriorityQueue } from '../extra/PriorityQueue.js';
import { HeuristicPolicyEuclid } from '../extra/HeuristicPolicy.js';

/**
* Implementation of the AStar algorithm.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class AStar {

	/**
	* Constructs an AStar algorithm object.
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

		/**
		* The heuristic of the search.
		* @type {Object}
		* @default HeuristicPolicyEuclid
		*/
		this.heuristic = HeuristicPolicyEuclid;

		this._cost = new Map(); // contains the "real" accumulative cost to a node
		this._shortestPathTree = new Map();
		this._searchFrontier = new Map();

	}

	/**
	* Executes the graph search. If the search was successful, {@link AStar#found}
	* is set to true.
	*
	* @return {AStar} A reference to this AStar object.
	*/
	search() {

		const outgoingEdges = new Array();
		const pQueue = new PriorityQueue( compare );

		pQueue.push( {
			cost: 0,
			index: this.source
		} );

		// while the queue is not empty

		while ( pQueue.length > 0 ) {

			const nextNode = pQueue.pop();
			const nextNodeIndex = nextNode.index;

			// if the shortest path tree has the given node, we already found the shortest
			// path to this particular one

			if ( this._shortestPathTree.has( nextNodeIndex ) ) continue;

			// move this edge from the frontier to the shortest path tree

			if ( this._searchFrontier.has( nextNodeIndex ) === true ) {

				this._shortestPathTree.set( nextNodeIndex, this._searchFrontier.get( nextNodeIndex ) );

			}

			// if the target has been found exit

			if ( nextNodeIndex === this.target ) {

				this.found = true;

				return this;

			}

			// now relax the edges

			this.graph.getEdgesOfNode( nextNodeIndex, outgoingEdges );

			for ( let i = 0, l = outgoingEdges.length; i < l; i ++ ) {

				const edge = outgoingEdges[ i ];

				// A* cost formula : F = G + H

				// G is the cumulative cost to reach a node

				const G = ( this._cost.get( nextNodeIndex ) || 0 ) + edge.cost;

				// H is the heuristic estimate of the distance to the target

				const H = this.heuristic.calculate( this.graph, edge.to, this.target );

				// F is the sum of G and H

				const F = G + H;

				// We enhance our search frontier in two cases:
				// 1. If the node was never on the search frontier
				// 2. If the cost to this node is better than before

				if ( ( this._searchFrontier.has( edge.to ) === false ) || G < ( this._cost.get( edge.to ) ) ) {

					this._cost.set( edge.to, G );

					this._searchFrontier.set( edge.to, edge );

					pQueue.push( {
						cost: F,
						index: edge.to
					} );

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

			currentNode = this._shortestPathTree.get( currentNode ).from;

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

		return [ ...this._shortestPathTree.values() ];

	}

	/**
	* Clears the internal state of the object. A new search is now possible.
	*
	* @return {AStar} A reference to this AStar object.
	*/
	clear() {

		this.found = false;

		this._cost.clear();
		this._shortestPathTree.clear();
		this._searchFrontier.clear();

		return this;

	}

}


function compare( a, b ) {

	return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

}


export { AStar };
