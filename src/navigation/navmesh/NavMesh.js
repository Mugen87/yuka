import { Graph } from '../../graph/core/Graph.js';
import { AStar } from '../../graph/search/AStar.js';
import { NavNode } from '../core/NavNode.js';
import { NavEdge } from '../core/NavEdge.js';
import { Vector3 } from '../../math/Vector3.js';
import { LineSegment } from '../../math/LineSegment.js';
import { Corridor } from './Corridor.js';

const pointOnLineSegment = new Vector3();
const edgeDirection = new Vector3();
const movementDirection = new Vector3();
const newPosition = new Vector3();
const lineSegment = new LineSegment();
const edges = new Array();
const closestBorderEdge = {
	edge: null,
	closestPoint: new Vector3()
};

/**
* Implementation of a navigation mesh. A navigation mesh is a network of convex polygons
* which define the walkable areas of a game environment. A convex polygon allows unobstructed travel
* from any point in the polygon to any other. This is useful because it enables the navigation mesh
* to be represented using a graph where each node represents a convex polygon and their respective edges
* represent the neighborly relations to other polygons. More compact navigation graphs lead
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
		* @type {Graph}
		*/
		this.graph = new Graph();
		this.graph.digraph = true;

		/**
		* The list of convex regions.
		* @type {Array<Polygon>}
		*/
		this.regions = new Array();

		/**
		* A reference to a spatial index.
		* @type {?CellSpacePartitioning}
		* @default null
		*/
		this.spatialIndex = null;

		/**
		* The tolerance value for the coplanar test.
		* @type {Number}
		* @default 1e-3
		*/
		this.epsilonCoplanarTest = 1e-3;

		/**
		* The tolerance value for the containment test.
		* @type {Number}
		* @default 1
		*/
		this.epsilonContainsTest = 1;

		/**
		* Whether convex regions should be merged or not.
		* @type {Boolean}
		* @default true
		*/
		this.mergeConvexRegions = true;

		//

		this._borderEdges = new Array();

	}

	/**
	* Creates the navigation mesh from an array of convex polygons.
	*
	* @param {Array<Polygon>} polygons - An array of convex polygons.
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

				if ( edge0.tail().equals( edge1.head() ) && edge0.head().equals( edge1.tail() ) ) {

					// opponent edge found, set twin references

					edge0.linkOpponent( edge1 );

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
	getClosestRegion( point ) {

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
	* of this method for complex navigation meshes can be reduced by using a spatial index.
	* If no convex region contains the point, *null* is returned.
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
	* Returns the node index for the given region. The index represents
	* the navigation node of a region in the navigation graph.
	*
	* @param {Polygon} region - The convex region.
	* @return {Number} The respective node index.
	*/
	getNodeIndex( region ) {

		return this.regions.indexOf( region );

	}

	/**
	* Returns the shortest path that leads from the given start position to the end position.
	* The computational overhead of this method for complex navigation meshes can greatly
	* reduced by using a spatial index.
	*
	* @param {Vector3} from - The start/source position.
	* @param {Vector3} to - The end/destination position.
	* @return {Array<Vector3>} The shortest path as an array of points.
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

			// source and target are not in same region, perform search

			const source = this.getNodeIndex( fromRegion );
			const target = this.getNodeIndex( toRegion );

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

					this._getPortalEdge( region, nextRegion, portalEdge );

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
	* movement is clamped along the contour of the navigation mesh. The computational overhead
	* of this method for complex navigation meshes can be reduced by using a spatial index.
	*
	* @param {Polygon} currentRegion - The current convex region of the game entity.
	* @param {Vector3} startPosition - The original start position of the entity for the current simulation step.
	* @param {Vector3} endPosition - The original end position of the entity for the current simulation step.
	* @param {Vector3} clampPosition - The clamped position of the entity for the current simulation step.
	* @return {Polygon} The new convex region the game entity is in.
	*/
	clampMovement( currentRegion, startPosition, endPosition, clampPosition ) {

		let newRegion = this.getRegionForPoint( endPosition, this.epsilonContainsTest );

		// if newRegion is null, "endPosition" lies outside of the navMesh

		if ( newRegion === null ) {

			if ( currentRegion === null ) throw new Error( 'YUKA.NavMesh.clampMovement(): No current region available.' );

			// determine closest border edge

			this._getClosestBorderEdge( startPosition, closestBorderEdge );

			const closestEdge = closestBorderEdge.edge;
			const closestPoint = closestBorderEdge.closestPoint;

			// calculate movement and edge direction

			closestEdge.getDirection( edgeDirection );
			const length = movementDirection.subVectors( endPosition, startPosition ).length();

			// this value influences the speed at which the entity moves along the edge

			let f = 0;

			// if startPosition and endPosition are equal, length becomes zero.
			// it's important to test this edge case in order to avoid NaN values.

			if ( length !== 0 ) {

				movementDirection.divideScalar( length );

				f = edgeDirection.dot( movementDirection );

			}

			// calculate new position on the edge

			newPosition.copy( closestPoint ).add( edgeDirection.multiplyScalar( f * length ) );

			// the following value "t" tells us if the point exceeds the line segment

			lineSegment.set( closestEdge.prev.vertex, closestEdge.vertex );
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

		if ( this.mergeConvexRegions === true ) {

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

		}

		// after the merging of convex regions, do some post-processing

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			// compute the centroid of the region which can be used as
			// a destination point in context of path finding

			region.computeCentroid();

			// gather all border edges used by clampMovement()

			let edge = region.edge;

			do {

				if ( edge.twin === null ) this._borderEdges.push( edge );

				edge = edge.next;

			} while ( edge !== region.edge );

		}

	}

	_buildGraph() {

		const graph = this.graph;
		const regions = this.regions;

		// for each region, the code creates an array of directly accessible regions

		const regionNeighbourhood = new Array();

		for ( let i = 0, l = regions.length; i < l; i ++ ) {

			const region = regions[ i ];

			const nodeIndices = new Array();
			regionNeighbourhood.push( nodeIndices );

			let edge = region.edge;

			// iterate through all egdes of the region (in other words: along its contour)

			do {

				// check for a portal edge

				if ( edge.twin !== null ) {

					const nodeIndex = this.getNodeIndex( edge.twin.polygon );

					nodeIndices.push( nodeIndex ); // the node index of the adjacent region

					// add node for this region to the graph if necessary

					if ( graph.hasNode( this.getNodeIndex( edge.polygon ) ) === false ) {

						const node = new NavNode( this.getNodeIndex( edge.polygon ), edge.polygon.centroid );

						graph.addNode( node );

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

	_getClosestBorderEdge( point, closestBorderEdge ) {

		let borderEdges;
		let minDistance = Infinity;

		if ( this.spatialIndex !== null ) {

			edges.length = 0;

			const index = this.spatialIndex.getIndexForPosition( point );
			const regions = this.spatialIndex.cells[ index ].entries;

			for ( let i = 0, l = regions.length; i < l; i ++ ) {

				const region = regions[ i ];

				let edge = region.edge;

				do {

					if ( edge.twin === null ) edges.push( edge );

					edge = edge.next;

				} while ( edge !== region.edge );

			}

			// use only border edges from adjacent convex regions (fast)

			borderEdges = edges;

		} else {

			// use all border edges (slow)

			borderEdges = this._borderEdges;

		}

		//

		for ( let i = 0, l = borderEdges.length; i < l; i ++ ) {

			const edge = borderEdges[ i ];

			lineSegment.set( edge.prev.vertex, edge.vertex );
			const t = lineSegment.closestPointToPointParameter( point );
			lineSegment.at( t, pointOnLineSegment );

			const distance = pointOnLineSegment.squaredDistanceTo( point );

			if ( distance < minDistance ) {

				minDistance = distance;

				closestBorderEdge.edge = edge;
				closestBorderEdge.closestPoint.copy( pointOnLineSegment );

			}

		}

		return this;

	}

	// Determines the portal edge that can be used to reach the given polygon over its twin reference.

	_getPortalEdge( region1, region2, portalEdge ) {

		let edge = region1.edge;

		do {

			if ( edge.twin !== null ) {

				if ( edge.twin.polygon === region2 ) {

					// the direction of portal edges are reversed. so "left" is the edge's origin vertex and "right"
					// is the destintation vertex. More details in issue #5

					portalEdge.left = edge.prev.vertex;
					portalEdge.right = edge.vertex;
					return portalEdge;

				}

			}

			edge = edge.next;

		} while ( edge !== region1.edge );

		portalEdge.left = null;
		portalEdge.right = null;

		return portalEdge;

	}

}

//

function descending( a, b ) {

	return ( a.cost < b.cost ) ? 1 : ( a.cost > b.cost ) ? - 1 : 0;

}

export { NavMesh };
