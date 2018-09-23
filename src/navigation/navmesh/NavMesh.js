/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

import { Graph } from '../../graph/core/Graph.js';
import { AStar } from '../../graph/search/AStar.js';
import { NavNode } from '../core/NavNode.js';
import { NavEdge } from '../core/NavEdge.js';
import { Vector3 } from '../../math/Vector3.js';
import { LineSegment } from '../../math/LineSegment.js';
import { Corridor } from "./Corridor.js";

const pointOnLineSegment = new Vector3();
const closestPoint = new Vector3();
const edgeDirection = new Vector3();
const movementDirection = new Vector3();
const newPosition = new Vector3();
const lineSegment = new LineSegment();

class NavMesh {

	constructor() {

		this.graph = new Graph();
		this.graph.digraph = true;

		this.regions = new Array();
		this.spatialIndex = null;

		this.epsilonCoplanarTest = 1e-3;
		this.epsilonContainsTest = 1;

	}

	fromPolygons( polygons ) {

		this.clear();

		//

		const initialEdgeList = new Array();
		const sortedEdgeList = new Array();

		// setup list with all edges

		for ( let i = 0, l = polygons.length; i < l; i ++ ) {

			const polygon = polygons[ i ];

			let edge = polygon.edge;

			do {

				initialEdgeList.push( edge );

				edge = edge.next;

			} while ( edge !== polygon.edge );

			//

			this.regions.push( polygon );

		}

		// setup twin references and sorted list of edges

		for ( let i = 0, il = initialEdgeList.length; i < il; i ++ ) {

			let edge0 = initialEdgeList[ i ];

			if ( edge0.twin !== null ) continue;

			for ( let j = i + 1, jl = initialEdgeList.length; j < jl; j ++ ) {

				let edge1 = initialEdgeList[ j ];

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
		this.regions.length = 0;
		this.spatialIndex = null;

		return this;

	}

	getClosestRegion( point ) {

		const regions = this.regions;
		let closesRegion = null;
		let minDistance = Infinity;

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const distance = point.squaredDistanceTo( region.centroid );

			if ( distance < minDistance ) {

				minDistance = distance;

				closesRegion = region;

			}

		}

		return closesRegion;

	}

	getRandomRegion() {

		const regions = this.regions;

		let index = Math.floor( Math.random() * ( regions.length ) );

		if ( index === regions.length ) index = regions.length - 1;

		return regions[ index ];

	}

	getRegionForPoint( point, epsilon = 1e-3 ) {

		let regions;

		if ( this.spatialIndex !== null ) {

			const index = this.spatialIndex.getIndexForPosition( point );
			regions = this.spatialIndex.cells[ index ].entries;

		} else {

			regions = this.regions;

		}

		//

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			if ( region.contains( point, epsilon ) === true ) {

				return region;

			}

		}

		return null;

	}

	findPath( from, to ) {

		const graph = this.graph;
		const path = new Array();

		let fromRegion = this.getRegionForPoint( from, this.epsilonContainsTest );
		let toRegion = this.getRegionForPoint( to, this.epsilonContainsTest );

		if ( fromRegion === null || toRegion === null ) {

			// if source or target are outside the navmesh, choose the nearest convex region

			if ( fromRegion === null ) fromRegion = this.getClosestRegion( from );
			if ( toRegion === null ) toRegion = this.getClosestRegion( to );

		}

		// check if both convex region are identical

		if ( fromRegion === toRegion ) {

			// no search necessary, directly create the path

			path.push( new Vector3().copy( from ) );
			path.push( new Vector3().copy( to ) );
			return path;

		} else {

			// source and target are not in same region, peform search

			const source = this.regions.indexOf( fromRegion );
			const target = this.regions.indexOf( toRegion );

			const astar = new AStar( graph, source, target );
			astar.search();

			if ( astar.found === true ) {

				const polygonPath = astar.getPath();

				const corridor = new Corridor();
				corridor.push( from, from );

				// push sequence of portal edges to corridor

				const portalEdge = { left: null, right: null };

				for ( let i = 0, l = ( polygonPath.length - 1 ); i < l; i ++ ) {

					const region = this.regions[ polygonPath[ i ] ];
					const nextRegion = this.regions[ polygonPath[ i + 1 ] ];

					region.getPortalEdgeTo( nextRegion, portalEdge );

					corridor.push( portalEdge.left, portalEdge.right );

				}

				corridor.push( to, to );

				path.push( ...corridor.generate() );

			}

			return path;

		}

	}

	clampMovement( currentRegion, startPosition, endPosition, clampPosition ) {

		let newRegion = this.getRegionForPoint( endPosition, this.epsilonContainsTest );

		// endPosition lies outside navMesh

		if ( newRegion === null ) {

			if ( currentRegion === null ) throw new Error( 'YUKA.NavMesh.clampMovement(): No current region available.' );

			// determine closest edge in current convex region

			let closestEdge = null;
			let minDistance = Infinity;

			let edge = currentRegion.edge;

			do {

				// only consider border edges

				if ( edge.twin === null ) {

					lineSegment.set( edge.vertex, edge.next.vertex );
					const t = lineSegment.closestPointToPointParameter( startPosition );
					lineSegment.at( t, pointOnLineSegment );

					const distance = pointOnLineSegment.squaredDistanceTo( startPosition );

					if ( distance < minDistance ) {

						minDistance = distance;

						closestEdge = edge;
						closestPoint.copy( pointOnLineSegment );

					}

				}

				edge = edge.next;

			} while ( edge !== currentRegion.edge );

			// calculate movement and edge direction

			edgeDirection.subVectors( closestEdge.next.vertex, closestEdge.vertex ).normalize();
			const length = movementDirection.subVectors( endPosition, startPosition ).length();
			movementDirection.divideScalar( length );

			// this value influences the speed at which the entity moves along the edge

			const f = edgeDirection.dot( movementDirection );

			// calculate new position on the edge

			newPosition.copy( closestPoint ).add( edgeDirection.multiplyScalar( f * length ) );

			// the following value "t" tells us if the point exceeds the line segment

			lineSegment.set( closestEdge.vertex, closestEdge.next.vertex );
			const t = lineSegment.closestPointToPointParameter( newPosition, false );

			//

			if ( t >= 0 && t <= 1 ) {

				// point is within line segment, we can safely use the new position

				clampPosition.copy( newPosition );

			} else {

				// check, if the new point lies outside the navMesh

				newRegion = this.getRegionForPoint( newPosition, this.epsilonContainsTest );

				if ( newRegion !== null ) {

					// if not, everything is fine

					clampPosition.copy( newPosition );
					return newRegion;

				}

				// otherwise prevent movement

				clampPosition.copy( startPosition );

			}

			return currentRegion;

		} else {

			// return the new region

			return newRegion;

		}

	}

	updateSpatialIndex() {

		if ( this.spatialIndex !== null ) {

			this.spatialIndex.makeEmpty();

			const regions = this.regions;

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				this.spatialIndex.addPolygon( region );

			}

		}

		return this;

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

		for ( let i = 0, l = edgeList.length; i < l; i ++ ) {

			const entry = edgeList[ i ];

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

			if ( polygon.convex() === true && polygon.coplanar( this.epsilonCoplanarTest ) === true ) {

				// correct polygon reference of all edges

				let edge = polygon.edge;

				do {

					edge.polygon = polygon;

					edge = edge.next;

				} while ( edge !== polygon.edge );

				// delete obsolete polygon

				const index = regions.indexOf( entry.edge.twin.polygon );
				regions.splice( index, 1 );

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

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			region.computeCentroid();

		}

	}

	_buildNodeIndices() {

		const regions = this.regions;

		const indicesMap = new Map();
		let nextNodeIndex = 0;

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			let edge = region.edge;

			do {

				// only edges with a twin reference needs to be considered

				if ( edge.twin !== null && edge.nodeIndex === null ) {

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
					edge.twin.next.nodeIndex = nodeIndex;

				}

				edge = edge.next;

			} while ( edge !== region.edge );

		}

	}

	_buildGraph() {

		const graph = this.graph;
		const regions = this.regions;

		// for each region, the code creates an array of directly accessible node indices

		const regionNeighbourhood = new Array();

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const regionIndices = new Array();
			regionNeighbourhood.push( regionIndices );

			let edge = region.edge;
			do {

				if ( edge.twin !== null ) {

					regionIndices.push( this.regions.indexOf( edge.twin.polygon ) );

					// add node to graph if necessary

					if ( graph.hasNode( this.regions.indexOf( edge.polygon ) ) === false ) {

						graph.addNode( new NavNode( this.regions.indexOf( edge.polygon ), edge.polygon.centroid ) );

					}

				}

				edge = edge.next;

			} while ( edge !== region.edge );

		}

		// add navigation edges

		for ( let i = 0, il = regionNeighbourhood.length; i < il; i ++ ) {

			const indices = regionNeighbourhood[ i ];
			const from = i;

			for ( let j = 0, jl = indices.length; j < jl; j ++ ) {

				const to = indices[ j ];

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

		return this;

	}

}

//

function descending( a, b ) {

	return ( a.cost < b.cost ) ? 1 : ( a.cost > b.cost ) ? - 1 : 0;

}

export { NavMesh };
