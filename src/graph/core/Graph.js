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
		this._edges.set( index, new Array() );

		return this;

	}

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

	getNode( index ) {

		return this._nodes.get( index ) || null;

	}

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

			count += edges.length;

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

	hasNode( index ) {

		return this._nodes.has( index );

	}

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

	clear() {

		this._nodes.clear();
		this._edges.clear();

		return this;

	}

}

export { Graph };
