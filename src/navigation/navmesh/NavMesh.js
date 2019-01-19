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

/**
* Implementation of a navigation mesh. A navigation mesh is a network of convex polygons
* which define the walkable areas of a game environment. A convex polygon allows unobstructed travel
* from any point in the polygon to any other. This is useful because it enables the navigation mesh
* to be represented using a graph where each node represents a convex polygon and their respective edges
* represent the neighborly relations to other polygons. More compact navigation graphs leads
* to faster graph search execution.
*
* This particular implementation is able to merge convex polygons into bigger ones as long
* as they keep their convexity and coplanarity. The performance of the path finding process and convex region tests
* for complex navigation meshes can be improved by using a spatial index like {@link CellSpacePartitioning}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class NavMesh {

	/**
	* Constructs a new navigation mesh.
	*/
	constructor() {

		/**
		* The internal navigation graph of this navigation mesh representing neighboring polygons.
		* @type Graph
		*/
		this.graph = new Graph();
		this.graph.digraph = true;

		/**
		* The list of convex regions.
		* @type Array
		*/
		this.regions = new Array();

		/**
		* A reference to a spatial index.
		* @type CellSpacePartitioning
		* @default null
		*/
		this.spatialIndex = null;

		/**
		* The tolerance value for the coplanar test.
		* @type Number
		* @default 1e-3
		*/
		this.epsilonCoplanarTest = 1e-3;

		/**
		* The tolerance value for the containment test.
		* @type Number
		* @default 1
		*/
		this.epsilonContainsTest = 1;

	}

	/**
	* Creates the navigation mesh from an array of convex polygons.
	*
	* @param {Array} polygons - An array of convex polygons.
	* @return {NavMesh} A reference to this navigation mesh.
	*/
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

		// half-edge data structure is now complete, begin build of convex regions

		this._buildRegions( sortedEdgeList );

		// ensure unique node indices for all twin edges

		this._buildNodeIndices();

		// now build the navigation graph

		this._buildGraph();

		return this;

	}

	/**
	* Clears the internal state of this navigation mesh.
	*
	* @return {NavMesh} A reference to this navigation mesh.
	*/
	clear() {

		this.graph.clear();
		this.regions.length = 0;
		this.spatialIndex = null;

		return this;

	}

	/**
	* Returns the closest convex region for the given point in 3D space.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Polygon} The closest convex region.
	*/
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

	/**
	* Returns at random a convex region from the navigation mesh.
	*
	* @return {Polygon} The convex region.
	*/
	getRandomRegion() {

		const regions = this.regions;

		let index = Math.floor( Math.random() * ( regions.length ) );

		if ( index === regions.length ) index = regions.length - 1;

		return regions[ index ];

	}

	/**
	* Returns the region that contains the given point. The computational overhead
	* of this method for complex navigation meshes can greatly reduced by using a spatial index.
	* If not convex region contains the point, *null* is returned.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Number} epsilon - Tolerance value for the containment test.
	* @return {Polygon} The convex region that contains the point.
	*/
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

	/**
	* Returns the shortest path that leads from the given start position to the end position.
	* The computational overhead of this method for complex navigation meshes can greatly
	* reduced by using a spatial index.
	*
	* @param {Vector3} from - The start/source position.
	* @param {Vector3} to - The end/destination position.
	* @return {Array} The shortest path as an array of points.
	*/
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

			// source and target are not in same region, peforme search

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

	/**
	* This method can be used to restrict the movement of a game entity on the navigation mesh.
	* Instead of preventing any form of translation when a game entity hits a border edge, the
	* movement is clamped along the contour of the navigation mesh.
	*
	* @param {Polygon} currentRegion - The current convex region of the game entity.
	* @param {Vector3} startPosition - The original start position of the entity for the current simulation step.
	* @param {Vector3} endPosition - The original end position of the entity for the current simulation step.
	* @param {Vector3} clampPosition - The clamped position of the entity for the current simulation step.
	* @return {Polygon} The new convex region the game entity is in.
	*/
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

	/**
	* Updates the spatial index by assigning all convex regions to the
	* partitions of the spatial index.
	*
	* @return {NavMesh} A reference to this navigation mesh.
	*/
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
