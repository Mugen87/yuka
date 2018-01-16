/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { PriorityQueue } from '../extra/PriorityQueue.js';

class Dijkstra {

	constructor( graph, source, target ) {

		this.graph = graph;
		this.source = source;
		this.target = target;
		this.found = false;

		this._cost = new Map(); // total cost of the bast path so far for a given node
		this._shortestPathTree = new Map();
		this._searchFrontier = new Map();
		this._visited = new Set(); // holds the visited nodes

	}

	search() {

		const outgoingEdges = [];
		let newCost = 0;

		var pQueue = new PriorityQueue( compare );

		pQueue.push( {
			cost: 0,
			index: this.source
		} );

		// while the queue is not empty

		while ( pQueue.length > 0 ) {

			const nextNode = pQueue.pop();
			const nextNodeIndex = nextNode.index;

			// if the node was visited in the past, we already found the shortest
			// path to this particular node

			if ( this._visited.has( nextNodeIndex ) ) continue;

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

			for ( let edge of outgoingEdges ) {

				// the total cost to the node this edge points to is the cost to the
				// current node plus the cost of the edge connecting them.

				newCost = ( this._cost.get( nextNodeIndex ) || 0 ) + edge.cost;

				// We enhance our search frontier in two cases:
				// 1. If the node was never on the search fontier
				// 2. If the cost the this node is better than before

				if ( ( this._searchFrontier.has( nextNodeIndex ) === false ) || newCost < ( this._cost.get( edge.to ) || Infinity ) ) {

					this._cost.set( edge.to, newCost );

					this._searchFrontier.set( edge.to, edge );

					pQueue.push( {
						cost: newCost,
						index: edge.to
					} );

				}

			}

			this._visited.add( nextNodeIndex );

		}

		this.found = false;

		return this;

	}

	getPath() {

		// array of node indices that comprise the shortest path from the source to the target

		const path = [];

		// just return an empty path if no path to target found or if no target has been specified

		if ( this.found === false || this.target === undefined ) return path;

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

	getSearchTree() {

		return [ ...this._shortestPathTree.values() ];

	}

	clear() {

		this.found = false;

		this._cost.clear();
		this._shortestPathTree.clear();
		this._searchFrontier.clear();
		this._visited.clear();

	}

}


function compare( a, b ) {

	return ( a.cost < b.cost ) ? - 1 : ( a.cost > b.cost ) ? 1 : 0;

}


export { Dijkstra };
