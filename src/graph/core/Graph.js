/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Graph {

	constructor() {

		this.digraph = false;

		this._nodes = new Map();
		this._edges = new Map(); // adjacency list for each node

	}

	addNode( node ) {

		const index = node.index;

		this._nodes.set( index, node );
		this._edges.set( index, new Set() );

		return this;

	}

	addEdge( edge ) {

		let edges;

		edges = this._edges.get( edge.from );
		edges.add( edge );

		if ( this.digraph === false ) {

			const oppositeEdge = edge.clone();

			oppositeEdge.from = edge.to;
			oppositeEdge.to = edge.from;

			edges = this._edges.get( edge.to );
			edges.add( oppositeEdge );

		}

		return this;

	}

	getNode( index ) {

		return this._nodes.get( index ) || null;

	}

	getEdge( from, to ) {

		if ( this.hasNode( from ) && this.hasNode( to ) ) {

			const edges = this._edges.get( from );

			for ( const edge of edges ) {

				if ( edge.to === to ) {

					return edge;

				}

			}

		}

		return null;

	}

	getNodes( result ) {

		result.length = 0;
		result.push( ...this._nodes.values() );

		return this;

	}

	getEdgesOfNode( index, result ) {

		const edges = this._edges.get( index );

		if ( edges !== undefined ) {

			result.length = 0;
			result.push( ...edges );

		}

		return this;

	}

	getNodeCount() {

		return this._nodes.size;

	}

	getEdgeCount() {

		let count = 0;

		for ( const edges of this._edges.values() ) {

			count += edges.size;

		}

		return count;

	}

	removeNode( node ) {

		this._nodes.delete( node.index );

		if ( this.digraph === false ) {

			// if the graph is not directed, remove all edges leading to this node

			const edges = this._edges.get( node.index );

			for ( const edge of edges ) {

				const edgesOfNeighbor = this._edges.get( edge.to );

				for ( const edgeNeighbor of edgesOfNeighbor ) {

					if ( edgeNeighbor.to === node.index ) {

						edgesOfNeighbor.delete( edgeNeighbor );
						break;

					}

				}

			}

		} else {

			// if the graph is directed, remove the edges the slow way

			for ( const edges of this._edges.values() ) {

				for ( const edge of edges ) {

					if ( ! this.hasNode( edge.to ) || ! this.hasNode( edge.from ) ) {

						edges.delete( edge );

					}

				}

			}

		}

		// delete edge list of node (edges leading from this node)

		this._edges.delete( node.index );

		return this;

	}

	removeEdge( edge ) {

		// delete the edge from the node's edge list

		const edges = this._edges.get( edge.from );

		if ( edges !== undefined ) {

			edges.delete( edge );

			// if the graph is not directed, delete the edge connecting the node in the opposite direction

			if ( this.digraph === false ) {

				const edges = this._edges.get( edge.to );

				for ( const e of edges ) {

					if ( e.to === edge.from ) {

						edges.delete( e );
						break;

					}

				}

			}

		}

		return this;

	}

	hasNode( index ) {

		return this._nodes.has( index );

	}

	hasEdge( from, to ) {

		if ( this.hasNode( from ) && this.hasNode( to ) ) {

			const edges = this._edges.get( from );

			for ( const e of edges ) {

				if ( e.to === to ) {

					return true;

				}

			}

			return false;

		} else {

			return false;

		}

	}

	clear() {

		this._nodes.clear();
		this._edges.clear();

		return this;

	}

}

export { Graph };
