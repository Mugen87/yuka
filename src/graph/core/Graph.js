import { Edge } from './Edge.js';
import { Node }	from './Node.js';

/**
* Class representing a sparse graph implementation based on adjacency lists.
* A sparse graph can be used to model many different types of graphs like navigation
* graphs (pathfinding), dependency graphs (e.g. technology trees) or state graphs
* (a representation of every possible state in a game).
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Graph {

	/**
	* Constructs a new graph.
	*/
	constructor() {

		/**
		* Whether this graph is directed or not.
		* @type {Boolean}
		* @default false
		*/
		this.digraph = false;

		this._nodes = new Map(); // contains all nodes in a map: (nodeIndex => node)
		this._edges = new Map(); // adjacency list for each node: (nodeIndex => edges)

	}

	/**
	* Adds a node to the graph.
	*
	* @param {Node} node - The node to add.
	* @return {Graph} A reference to this graph.
	*/
	addNode( node ) {

		const index = node.index;

		this._nodes.set( index, node );
		this._edges.set( index, new Array() );

		return this;

	}

	/**
	* Adds an edge to the graph. If the graph is undirected, the method
	* automatically creates the opponent edge.
	*
	* @param {Edge} edge - The edge to add.
	* @return {Graph} A reference to this graph.
	*/
	addEdge( edge ) {

		let edges;

		edges = this._edges.get( edge.from );
		edges.push( edge );

		if ( this.digraph === false ) {

			const oppositeEdge = edge.clone();

			oppositeEdge.from = edge.to;
			oppositeEdge.to = edge.from;

			edges = this._edges.get( edge.to );
			edges.push( oppositeEdge );

		}

		return this;

	}

	/**
	* Returns a node for the given node index. If no node is found,
	* *null* is returned.
	*
	* @param {Number} index - The index of the node.
	* @return {Node} The requested node.
	*/
	getNode( index ) {

		return this._nodes.get( index ) || null;

	}

	/**
	* Returns an edge for the given *from* and *to* node indices.
	* If no node is found, *null* is returned.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @return {Edge} The requested edge.
	*/
	getEdge( from, to ) {

		if ( this.hasNode( from ) && this.hasNode( to ) ) {

			const edges = this._edges.get( from );

			for ( let i = 0, l = edges.length; i < l; i ++ ) {

				const edge = edges[ i ];

				if ( edge.to === to ) {

					return edge;

				}

			}

		}

		return null;

	}

	/**
	* Gathers all nodes of the graph and stores them into the given array.
	*
	* @param {Array<Node>} result - The result array.
	* @return {Array<Node>} The result array.
	*/
	getNodes( result ) {

		result.length = 0;
		result.push( ...this._nodes.values() );

		return result;

	}

	/**
	* Gathers all edges leading from the given node index and stores them
	* into the given array.
	*
	* @param {Number} index - The node index.
	* @param {Array<Edge>} result - The result array.
	* @return {Array<Edge>} The result array.
	*/
	getEdgesOfNode( index, result ) {

		const edges = this._edges.get( index );

		if ( edges !== undefined ) {

			result.length = 0;
			result.push( ...edges );

		}

		return result;

	}

	/**
	* Returns the node count of the graph.
	*
	* @return {number} The amount of nodes.
	*/
	getNodeCount() {

		return this._nodes.size;

	}

	/**
	* Returns the edge count of the graph.
	*
	* @return {number} The amount of edges.
	*/
	getEdgeCount() {

		let count = 0;

		for ( const edges of this._edges.values() ) {

			count += edges.length;

		}

		return count;

	}

	/**
	* Removes the given node from the graph and all edges which are connected
	* with this node.
	*
	* @param {Node} node - The node to remove.
	* @return {Graph} A reference to this graph.
	*/
	removeNode( node ) {

		this._nodes.delete( node.index );

		if ( this.digraph === false ) {

			// if the graph is not directed, remove all edges leading to this node

			const edges = this._edges.get( node.index );

			for ( const edge of edges ) {

				const edgesOfNeighbor = this._edges.get( edge.to );

				for ( let i = ( edgesOfNeighbor.length - 1 ); i >= 0; i -- ) {

					const edgeNeighbor = edgesOfNeighbor[ i ];

					if ( edgeNeighbor.to === node.index ) {

						const index = edgesOfNeighbor.indexOf( edgeNeighbor );
						edgesOfNeighbor.splice( index, 1 );

						break;

					}

				}

			}

		} else {

			// if the graph is directed, remove the edges the slow way

			for ( const edges of this._edges.values() ) {

				for ( let i = ( edges.length - 1 ); i >= 0; i -- ) {

					const edge = edges[ i ];

					if ( ! this.hasNode( edge.to ) || ! this.hasNode( edge.from ) ) {

						const index = edges.indexOf( edge );
						edges.splice( index, 1 );

					}

				}

			}

		}

		// delete edge list of node (edges leading from this node)

		this._edges.delete( node.index );

		return this;

	}

	/**
	* Removes the given edge from the graph. If the graph is undirected, the
	* method also removes the opponent edge.
	*
	* @param {Edge} edge - The edge to remove.
	* @return {Graph} A reference to this graph.
	*/
	removeEdge( edge ) {

		// delete the edge from the node's edge list

		const edges = this._edges.get( edge.from );

		if ( edges !== undefined ) {

			const index = edges.indexOf( edge );
			edges.splice( index, 1 );

			// if the graph is not directed, delete the edge connecting the node in the opposite direction

			if ( this.digraph === false ) {

				const edges = this._edges.get( edge.to );

				for ( let i = 0, l = edges.length; i < l; i ++ ) {

					const e = edges[ i ];

					if ( e.to === edge.from ) {

						const index = edges.indexOf( e );
						edges.splice( index, 1 );
						break;

					}

				}

			}

		}

		return this;

	}

	/**
	* Return true if the graph has the given node index.
	*
	* @param {Number} index - The node index to test.
	* @return {Boolean} Whether this graph has the node or not.
	*/
	hasNode( index ) {

		return this._nodes.has( index );

	}

	/**
	* Return true if the graph has an edge connecting the given
	* *from* and *to* node indices.
	*
	* @param {Number} from - The index of the from node.
	* @param {Number} to - The index of the to node.
	* @return {Boolean} Whether this graph has the edge or not.
	*/
	hasEdge( from, to ) {

		if ( this.hasNode( from ) && this.hasNode( to ) ) {

			const edges = this._edges.get( from );

			for ( let i = 0, l = edges.length; i < l; i ++ ) {

				const edge = edges[ i ];

				if ( edge.to === to ) {

					return true;

				}

			}

			return false;

		} else {

			return false;

		}

	}

	/**
	* Removes all nodes and edges from this graph.
	*
	* @return {Graph} A reference to this graph.
	*/
	clear() {

		this._nodes.clear();
		this._edges.clear();

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			digraph: this.digraph
		};

		const edges = new Array();
		const nodes = new Array();

		for ( let [ key, value ] of this._nodes.entries() ) {

			const adjacencyList = new Array();

			this.getEdgesOfNode( key, adjacencyList );

			for ( let i = 0, l = adjacencyList.length; i < l; i ++ ) {

				edges.push( adjacencyList[ i ].toJSON() );

			}

			nodes.push( value.toJSON() );

		}

		json._edges = edges;
		json._nodes = nodes;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Graph} A reference to this graph.
	*/
	fromJSON( json ) {

		this.digraph = json.digraph;

		for ( let i = 0, l = json._nodes.length; i < l; i ++ ) {

			this.addNode( new Node().fromJSON( json._nodes[ i ] ) );

		}

		for ( let i = 0, l = json._edges.length; i < l; i ++ ) {

			this.addEdge( new Edge().fromJSON( json._edges[ i ] ) );

		}

		return this;

	}

}

export { Graph };
