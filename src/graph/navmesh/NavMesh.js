/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Graph } from '../core/Graph.js';
import { NavNode } from '../navigation/NavNode.js';
import { NavEdge } from '../navigation/NavEdge.js';
import { AStar } from '../search/AStar.js';
import { Vector3 } from '../../math/Vector3.js';

class NavMesh {

	constructor() {

		this.graph = new Graph();
		this.graph.digraph = true;

		this.regions = new Set();

	}

	fromPolygons( polygons ) {

		this.clear();

		//

		const initialEdgeList = [];
		const sortedEdgeList = [];

		// setup list with all edges

		for ( let polygon of polygons ) {

			let edge = polygon.edge;

			do {

				initialEdgeList.push( edge );

				edge = edge.next;

			} while ( edge !== polygon.edge );

			//

			this.regions.add( polygon );

		}

		// setup twin references and sorted list of edges

		for ( let edge0 of initialEdgeList ) {

			if ( edge0.twin !== null ) continue;

			for ( let edge1 of initialEdgeList ) {

				if ( edge0.from().equals( edge1.to() ) && edge0.to().equals( edge1.from() ) ) {

					// twin found, set references

					edge0.twin = edge1;
					edge1.twin = edge0;

					// add edge to list

					const cost = edge0.squaredLength();

					sortedEdgeList.push( {
						cost: cost,
						edge: edge0
					} );

					// there can only be a single twin

					break;

				}

			}

		}

		sortedEdgeList.sort( descending );

		// hald-edge data structure is now complete, begin build of convex regions

		this._buildRegions( sortedEdgeList );

		// ensure unique node indices for all twin edges

		this._buildNodeIndices();

		// now build the navigation graph

		this._buildGraph();

		return this;

	}

	clear() {

		this.graph.clear();
		this.regions.clear();

		return this;

	}

	getClosestNodeIndex( point ) {

		const graph = this.graph;
		let closesNodeIndex = null;
		let minDistance = Infinity;

		const nodes = [];

		graph.getNodes( nodes );

		for ( const node of nodes ) {

			const distance = point.squaredDistanceTo( node.position );

			if ( distance < minDistance ) {

				minDistance = distance;

				closesNodeIndex = node.index;

			}

		}

		return closesNodeIndex;

	}

	getClosestNodeIndexInRegion( point, region ) {

		let closesNodeIndex = null;
		let minDistance = Infinity;

		let edge = region.edge;

		do {

			if ( edge.twin || edge.prev.twin ) {

				const distance = point.squaredDistanceTo( edge.from() );

				if ( distance < minDistance ) {

					minDistance = distance;

					closesNodeIndex = edge.twin ? edge.nodeIndex : edge.prev.twin.nodeIndex;

				}

			}

			edge = edge.next;

		} while ( edge !== region.edge );

		return closesNodeIndex;

	}

	getClosestRegion( point ) {

		const regions = this.regions;
		let closesRegion = null;
		let minDistance = Infinity;

		for ( const region of regions ) {

			const distance = point.squaredDistanceTo( region.centroid );

			if ( distance < minDistance ) {

				minDistance = distance;

				closesRegion = region;

			}

		}

		return closesRegion;

	}

	getRegionForPoint( point, epsilon = 1e-3 ) {

		const regions = this.regions;

		for ( let region of regions ) {

			if ( region.contains( point, epsilon ) === true ) {

				return region;

			}

		}

		return null;

	}

	findPath( from, to ) {

		const graph = this.graph;

		const fromRegion = this.getRegionForPoint( from );
		const toRegion = this.getRegionForPoint( to );

		const path = [];

		// 1. ensure start and end point are inside the navmesh

		if ( fromRegion === null || toRegion === null ) {

			// return empty path

			return path;

		}

		// 2. check if both points are in the same convex region

		if ( fromRegion === toRegion ) {

			// no search necessary, directly create the path

			path.push( new Vector3().copy( from ) );
			path.push( new Vector3().copy( to ) );
			return path;

		} else {

			// points are not in same region, peform search

			const source = this.getClosestNodeIndexInRegion( from, fromRegion );
			const target = this.getClosestNodeIndexInRegion( to, toRegion );

			const astar = new AStar( graph, source, target );
			astar.search();

			if ( astar.found === true ) {

				const shortestPath = astar.getPath();

				let count = shortestPath.length;

				// smoothing

				for ( let i = 0, l = shortestPath.length; i < l; i ++ ) {

					const index = shortestPath[ i ];
					const node = graph.getNode( index );

					if ( fromRegion.contains( node.position ) === false ) {

						count = i;
						break;

					}

				}

				shortestPath.splice( 0, count - 1 );

				//

				shortestPath.reverse();

				count = shortestPath.length;

				for ( let i = 0, l = shortestPath.length; i < l; i ++ ) {

					const index = shortestPath[ i ];
					const node = graph.getNode( index );

					if ( toRegion.contains( node.position ) === false ) {

						count = i;
						break;

					}

				}

				shortestPath.splice( 0, count - 1 );

				shortestPath.reverse();

				// create final path

				path.push( new Vector3().copy( from ) );

				for ( const index of shortestPath ) {

					const node = graph.getNode( index );
					path.push( new Vector3().copy( node.position ) );

				}

				path.push( new Vector3().copy( to ) );

			}

			return path;

		}

	}

	_buildRegions( edgeList ) {

		const regions = this.regions;

		const cache = {
			leftPrev: null,
			leftNext: null,
			rightPrev: null,
			rightNext: null
		};

		// process edges from longest to shortest

		for ( let entry of edgeList ) {

			let candidate = entry.edge;

			// cache current references for possible restore

			cache.prev = candidate.prev;
			cache.next = candidate.next;
			cache.prevTwin = candidate.twin.prev;
			cache.nextTwin = candidate.twin.next;

			// temporarily change the first polygon in order to represent both polygons

			candidate.prev.next = candidate.twin.next;
			candidate.next.prev = candidate.twin.prev;
			candidate.twin.prev.next = candidate.next;
			candidate.twin.next.prev = candidate.prev;

			const polygon = candidate.polygon;
			polygon.edge = candidate.prev;

			if ( polygon.convex() === true ) {

				// correct polygon reference of all edges

				let edge = polygon.edge;

				do {

					edge.polygon = polygon;

					edge = edge.next;

				} while ( edge !== polygon.edge );

				// delete obsolete polygon

				regions.delete( entry.edge.twin.polygon );

			} else {

				// restore

				cache.prev.next = candidate;
				cache.next.prev = candidate;
				cache.prevTwin.next = candidate.twin;
				cache.nextTwin.prev = candidate.twin;

				polygon.edge = candidate;

			}

		}

		//

		for ( const region of regions ) {

			region.computeCentroid();

		}

	}

	_buildNodeIndices() {

		const regions = this.regions;

		const indicesMap = new Map();
		let nextNodeIndex = 0;

		for ( const region of regions ) {

			let edge = region.edge;

			do {

				// only edges with a twin reference needs to be considered

				if ( edge.twin !== null ) {

					let nodeIndex = - 1;
					const position = edge.from();

					// check all existing entries

					for ( const [ index, pos ] of indicesMap.entries() ) {

						if ( position.equals( pos ) === true ) {

							// found, use the existing index

							nodeIndex = index;
							break;

						}

					}

					// if no suitable index was found, create a new one

					if ( nodeIndex === - 1 ) {

						nodeIndex = nextNodeIndex ++;
						indicesMap.set( nodeIndex, position );

					}

					// assign unique node index to edge

					edge.nodeIndex = nodeIndex;

				}

				edge = edge.next;

			} while ( edge !== region.edge );

		}

	}

	_buildGraph() {

		const graph = this.graph;
		const regions = this.regions;

		// for each region, the code creates an array of directly accessible node indices

		const nodeIndicesPerRegion = new Set();

		for ( const region of regions ) {

			const nodeIndices = new Array();
			nodeIndicesPerRegion.add( nodeIndices );

			let edge = region.edge;

			do {

				if ( edge.twin !== null ) {

					nodeIndices.push( edge.nodeIndex, edge.twin.nodeIndex );

					// add node to graph if necessary

					if ( graph.hasNode( edge.nodeIndex ) === false ) {

						graph.addNode( new NavNode( edge.nodeIndex, edge.from() ) );

					}

				}

				edge = edge.next;

			} while ( edge !== region.edge );

		}

		// add navigation edges

		for ( const indices of nodeIndicesPerRegion ) {

			for ( const from of indices ) {

				for ( const to of indices ) {

					if ( from !== to ) {

						if ( graph.hasEdge( from, to ) === false ) {

							const nodeFrom = graph.getNode( from );
							const nodeTo = graph.getNode( to );

							const cost = nodeFrom.position.distanceTo( nodeTo.position );

							graph.addEdge( new NavEdge( from, to, cost ) );

						}

					}

				}

			}

		}

		return this;

	}

}

//

function descending( a, b ) {

	return ( a.cost < b.cost ) ? 1 : ( a.cost > b.cost ) ? - 1 : 0;

}

export { NavMesh };
