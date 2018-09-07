/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const NavMesh = YUKA.NavMesh;
const Polygon = YUKA.Polygon;
const Graph = YUKA.Graph;
const Vector3 = YUKA.Vector3;

// setup navigation mesh

const p1 = new Polygon();
const p2 = new Polygon();
const p3 = new Polygon();
const p4 = new Polygon();

const v1 = [
	new Vector3( 0, 0, 0 ),
	new Vector3( 0.5, 0, 1 ),
	new Vector3( 1, 0, 0 )
];

const v2 = [
	new Vector3( 1, 0, 0 ),
	new Vector3( 0.5, 0, 1 ),
	new Vector3( 1, 0, 1 )
];

const v3 = [
	new Vector3( 0, 0, 0 ),
	new Vector3( - 2, 0, 1 ),
	new Vector3( 0.5, 0, 1 )
];

const v4 = [
	new Vector3( 0.5, 0, 1 ),
	new Vector3( - 2, 0, 1 ),
	new Vector3( 0, 0, 2 )
];

p1.fromContour( v1 );
p2.fromContour( v2 );
p3.fromContour( v3 );
p4.fromContour( v4 );

const navMesh = new NavMesh().fromPolygons( [ p1, p2, p3, p4 ] );

//

describe( 'NavMesh', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const navMesh = new NavMesh();
			expect( navMesh ).to.have.a.property( 'regions' ).that.is.a( 'set' );
			expect( navMesh ).to.have.a.property( 'graph' ).that.is.an.instanceof( Graph );
			expect( navMesh.graph.digraph ).to.be.true;

		} );

	} );

	describe( '#fromPolygons()', function () {

		it( 'should merge polygons to convex regions if possible', function () {

			// p3 and p4 are merged into p1

			expect( navMesh.regions.size ).to.equal( 2 );
			expect( navMesh.regions.has( p1 ) ).to.be.true;
			expect( navMesh.regions.has( p2 ) ).to.be.true;

		} );

		it( 'should build a navigation graph from the convex regions', function () {

			// a single transition between two polygons leads to two nodes connected via two edges

			expect( navMesh.graph.getNodeCount() ).to.equal( 2 );
			expect( navMesh.graph.getEdgeCount() ).to.equal( 2 );

			const position1 = new Vector3( 0.5, 0, 1 );
			const position2 = new Vector3( 1, 0, 0 );

			const node1 = navMesh.graph.getNode( 0 );
			const node2 = navMesh.graph.getNode( 1 );

			expect( node1.position ).to.deep.equal( position1 );
			expect( node2.position ).to.deep.equal( position2 );

			const edge1 = navMesh.graph.getEdge( 0, 1 );
			const edge2 = navMesh.graph.getEdge( 1, 0 );

			expect( edge1.from ).to.equal( 0 );
			expect( edge1.to ).to.equal( 1 );
			expect( edge2.from ).to.equal( 1 );
			expect( edge2.to ).to.equal( 0 );

		} );

	} );

	describe( '#getClosestNodeIndex()', function () {

		it( 'should return the closest node index for the given point', function () {

			const point1 = new Vector3( 0.6, 0, 1 );
			const point2 = new Vector3( 1.2, 0, 0.2 );

			const nodeIndex1 = navMesh.getClosestNodeIndex( point1 );
			const nodeIndex2 = navMesh.getClosestNodeIndex( point2 );

			expect( nodeIndex1 ).to.equal( 0 );
			expect( nodeIndex2 ).to.equal( 1 );

		} );

	} );

	describe( '#getClosestNodeIndexInRegion()', function () {

		it( 'should return the closest node index of a region for the given point', function () {

			// nodes are ( 0.5, 0, 1 ) and ( 1, 0, 0 )

			const point1 = new Vector3( 0.6, 0, 1 );
			const point2 = new Vector3( 1.2, 0, 0.2 );

			const nodeIndex1 = navMesh.getClosestNodeIndexInRegion( point1, p1 );
			const nodeIndex2 = navMesh.getClosestNodeIndexInRegion( point2, p2 );

			expect( nodeIndex1 ).to.equal( 0 );
			expect( nodeIndex2 ).to.equal( 1 );

		} );

		it( 'should use the third parameter to calculate a heuristic used to pick the best possible node', function () {

			// nodes are ( 0.5, 0, 1 ) and ( 1, 0, 0 )

			const point = new Vector3( 0.8, 0, 0.5 );
			const target = new Vector3( 0, 0, 1.5 );

			const nodeIndex1 = navMesh.getClosestNodeIndexInRegion( point, p1 );
			const nodeIndex2 = navMesh.getClosestNodeIndexInRegion( point, p1, target );

			expect( nodeIndex1 ).to.equal( 1 );
			expect( nodeIndex2 ).to.equal( 0 ); // nodeIndex 0 is actually the better choice since

		} );

	} );

	describe( '#getClosestRegion()', function () {

		it( 'should return the closest region for the given point', function () {

			const point1 = new Vector3( - 0.5, 0, 0 );
			const point2 = new Vector3( 1.1, 0, 1.1 );

			const region1 = navMesh.getClosestRegion( point1 );
			const region2 = navMesh.getClosestRegion( point2 );

			expect( region1 ).to.equal( p1 );
			expect( region2 ).to.equal( p2 );

		} );

	} );

	describe( '#getRegionForPoint()', function () {

		it( 'should return the region that contains the given point', function () {

			const point1 = new Vector3( 0.5, 0, 0.5 );
			const point2 = new Vector3( 0.9, 0, 0.9 );

			const region1 = navMesh.getRegionForPoint( point1 );
			const region2 = navMesh.getRegionForPoint( point2 );

			expect( region1 ).to.equal( p1 );
			expect( region2 ).to.equal( p2 );

		} );

		it( 'should respect the epsilon parameter to influence the tolerance', function () {

			const point = new Vector3( 0.5, - 0.01, 0.5 );
			const epsilon = 0.02;

			const region1 = navMesh.getRegionForPoint( point );
			const region2 = navMesh.getRegionForPoint( point, epsilon );

			expect( region1 ).to.be.null;
			expect( region2 ).to.equal( p1 );

		} );

	} );

	describe( '#findPath()', function () {

		it( 'should return a path as an array of Vector3 from the start to end position', function () {

			const from = new Vector3( - 1, 0, 1 );
			const to = new Vector3( 0.9, 0, 0.9 );

			const path = navMesh.findPath( from, to );

			expect( path ).to.be.an( 'array' );
			expect( path ).to.have.lengthOf( 3 );
			expect( path[ 0 ] ).to.be.instanceof( Vector3 );
			expect( path[ 1 ] ).to.be.instanceof( Vector3 );
			expect( path[ 2 ] ).to.be.instanceof( Vector3 );

			expect( path[ 0 ] ).to.deep.equal( from );
			expect( path[ 1 ] ).to.deep.equal( { x: 0.5, y: 0, z: 1 } );
			expect( path[ 2 ] ).to.deep.equal( to );

		} );

		it( 'should search for the closest convex region if one or both points lies outside the navmesh', function () {

			const from = new Vector3( - 1, 0, 2 );
			const to = new Vector3( 1.1, 0, 1.1 );

			const path = navMesh.findPath( from, to );

			expect( path ).to.be.an( 'array' );
			expect( path ).to.have.lengthOf( 3 );
			expect( path[ 0 ] ).to.deep.equal( from );
			expect( path[ 1 ] ).to.deep.equal( { x: 0.5, y: 0, z: 1 } );
			expect( path[ 2 ] ).to.deep.equal( to );

		} );

		it( 'should perform no graph search if start and end position are in the same convex region', function () {

			const from = new Vector3( - 1, 0, 1 );
			const to = new Vector3( - 0.5, 0, 1 );

			const path = navMesh.findPath( from, to );

			expect( path ).to.be.an( 'array' );
			expect( path ).to.have.lengthOf( 2 );
			expect( path[ 0 ] ).to.deep.equal( from );
			expect( path[ 1 ] ).to.deep.equal( to );

		} );

	} );

	describe( '#clampMovement()', function () {

		it( 'should clamp the movement of an entity if the end position lies outside the navMesh and return the respective convex region', function () {

			const from = new Vector3( 0.5, 0, 0.5 );
			const to = new Vector3( 0.5, 0, - 0.5 );
			const clampedPosition = new Vector3();
			const currentRegion = navMesh.getRegionForPoint( from );

			const newRegion = navMesh.clampMovement( currentRegion, from, to, clampedPosition );

			expect( clampedPosition ).to.deep.equal( { x: 0.5, y: 0, z: 0 } );
			expect( newRegion ).to.equal( p1 );

		} );

		it( 'should just return the new region if the end position lies inside the navMesh', function () {

			const from = new Vector3( 0.5, 0, 0.5 );
			const to = new Vector3( 0.5, 0, 0.4 );
			const clampedPosition = new Vector3();
			const currentRegion = navMesh.getRegionForPoint( from );

			const newRegion = navMesh.clampMovement( currentRegion, from, to, clampedPosition );

			expect( clampedPosition ).to.deep.equal( { x: 0, y: 0, z: 0 } ); // no change
			expect( newRegion ).to.equal( p1 );

		} );

		it( 'should prevent any movement if the new position would lie outside of the navMesh', function () {

			const from = new Vector3( 0.5, 0, 0.5 );
			const to = new Vector3( 2, 0, - 1 );
			const clampedPosition = new Vector3();
			const currentRegion = navMesh.getRegionForPoint( from );

			const newRegion = navMesh.clampMovement( currentRegion, from, to, clampedPosition );

			expect( clampedPosition ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );
			expect( newRegion ).to.equal( p1 );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should merge polygons to convex regions if possible', function () {

			navMesh.clear();
			expect( navMesh.regions.size ).to.equal( 0 );
			expect( navMesh.graph.getNodeCount() ).to.equal( 0 );
			expect( navMesh.graph.getEdgeCount() ).to.equal( 0 );

		} );

	} );

} );
