/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const NavMesh = YUKA.NavMesh;
const Polygon = YUKA.Polygon;
const Graph = YUKA.Graph;
const Vector3 = YUKA.Vector3;
const CellSpacePartitioning = YUKA.CellSpacePartitioning;

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

const width = 4, height = 1, depth = 4;
const cellsX = 2, cellsY = 1, cellsZ = 2;

//

describe( 'NavMesh', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const navMesh = new NavMesh();
			expect( navMesh ).to.have.a.property( 'regions' ).that.is.an( 'array' );
			expect( navMesh ).to.have.a.property( 'graph' ).that.is.an.instanceof( Graph );
			expect( navMesh ).to.have.a.property( 'spatialIndex' ).that.is.null;
			expect( navMesh ).to.have.a.property( 'epsilonCoplanarTest' ).that.is.equal( 1e-3 );
			expect( navMesh ).to.have.a.property( 'epsilonContainsTest' ).that.is.equal( 1 );
			expect( navMesh ).to.have.a.property( 'mergeConvexRegions' ).to.be.true;
			expect( navMesh ).to.have.a.property( '_borderEdges' ).that.is.an( 'array' );
			expect( navMesh.graph.digraph ).to.be.true;

		} );

	} );

	describe( '#fromPolygons()', function () {

		it( 'should merge polygons to convex regions if possible', function () {

			// p3 and p4 are merged into p1

			expect( navMesh.regions ).to.have.lengthOf( 2 );
			expect( navMesh.regions ).to.include( p1, p2 );

		} );

		it( 'should build a navigation graph from the convex regions', function () {

			// a single transition between two polygons leads to two nodes connected via two edges

			expect( navMesh.graph.getNodeCount() ).to.equal( 2 );
			expect( navMesh.graph.getEdgeCount() ).to.equal( 2 );

			const node1 = navMesh.graph.getNode( 0 );
			const node2 = navMesh.graph.getNode( 1 );

			expect( node1.position ).to.deep.equal( p1.centroid );
			expect( node2.position ).to.deep.equal( p2.centroid );

			const edge1 = navMesh.graph.getEdge( 0, 1 );
			const edge2 = navMesh.graph.getEdge( 1, 0 );

			expect( edge1.from ).to.equal( 0 );
			expect( edge1.to ).to.equal( 1 );
			expect( edge2.from ).to.equal( 1 );
			expect( edge2.to ).to.equal( 0 );

			expect( navMesh._borderEdges ).to.have.lengthOf( 6 );

		} );

		it( 'should not merge convex regions if .mergeConvexRegions is set to false', function () {

			const p1 = new Polygon();
			const p2 = new Polygon();
			const p3 = new Polygon();
			const p4 = new Polygon();

			p1.fromContour( v1 );
			p2.fromContour( v2 );
			p3.fromContour( v3 );
			p4.fromContour( v4 );

			const navMesh = new NavMesh();
			navMesh.mergeConvexRegions = false;
			navMesh.fromPolygons( [ p1, p2, p3, p4 ] );

			expect( navMesh.regions ).to.have.lengthOf( 4 );
			expect( navMesh.regions ).to.include( p1, p2, p3, p4 );

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

	describe( '#getRandomRegion()', function () {

		it( 'should return a random region from the navigation mesh', function () {

			const region = navMesh.getRandomRegion();
			expect( navMesh.regions ).to.include( region );

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

		it( 'should use a spatial index if possible', function () {

			const spatialIndex = new CellSpacePartitioning( width, height, depth, cellsX, cellsY, cellsZ );
			navMesh.spatialIndex = spatialIndex;
			navMesh.updateSpatialIndex();

			const point1 = new Vector3( 0.5, 0, 0.5 );
			const point2 = new Vector3( 0.9, 0, 0.9 );

			const region1 = navMesh.getRegionForPoint( point1 );
			const region2 = navMesh.getRegionForPoint( point2 );

			expect( region1 ).to.equal( p1 );
			expect( region2 ).to.equal( p2 );

			navMesh.spatialIndex = null;

		} );

	} );

	describe( '#getNodeIndex()', function () {

		it( 'should return the node index for the given region', function () {

			const point1 = new Vector3( 0.5, 0, 0.5 );
			const point2 = new Vector3( 0.9, 0, 0.9 );

			const region1 = navMesh.getRegionForPoint( point1 );
			const region2 = navMesh.getRegionForPoint( point2 );

			expect( navMesh.getNodeIndex( region1 ) ).to.equal( 0 );
			expect( navMesh.getNodeIndex( region2 ) ).to.equal( 1 );

		} );

	} );

	describe( '#findPath()', function () {

		it( 'should return a path as an array of Vector3 from the start to end position', function () {

			const from = new Vector3( 0, 0, 1.5 );
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

		it( 'should smooth the path if navigation points are directly visible', function () {

			const from = new Vector3( 0, 0, 0.5 );
			const to = new Vector3( 0.9, 0, 0.5 );

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

		it( 'should prevent any movement if the new position lies outside of the navMesh', function () {

			const from = new Vector3( 0.5, 0, 0.5 );
			const to = new Vector3( 2, 0, - 1 );
			const clampedPosition = new Vector3();
			const currentRegion = navMesh.getRegionForPoint( from );

			const newRegion = navMesh.clampMovement( currentRegion, from, to, clampedPosition );

			expect( clampedPosition ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );
			expect( newRegion ).to.equal( p1 );

		} );

		it( 'should not throw an error if start and end position are equal', function () {

			const from = new Vector3( 2, 0, - 1 );
			const to = new Vector3( 2, 0, - 1 );
			const clampedPosition = new Vector3();

			const currentRegion = navMesh.getRegionForPoint( new Vector3( 0.5, 0, 0.5 ) );

			const newRegion = navMesh.clampMovement( currentRegion, from, to, clampedPosition );

			expect( clampedPosition ).to.deep.equal( { x: 1, y: 0, z: 0 } );
			expect( newRegion ).to.equal( p1 );

		} );

	} );

	describe( '#updateSpatialIndex()', function () {

		it( 'should set the given spatial index', function () {

			const spatialIndex = new CellSpacePartitioning( width, height, depth, cellsX, cellsY, cellsZ );
			navMesh.spatialIndex = spatialIndex;
			navMesh.updateSpatialIndex();

			expect( spatialIndex.cells[ 0 ].entries ).to.include( p1 );
			expect( spatialIndex.cells[ 1 ].entries ).to.include( p1 );
			expect( spatialIndex.cells[ 2 ].entries ).to.include( p1, p2 );
			expect( spatialIndex.cells[ 3 ].entries ).to.include( p1, p2 );

			navMesh.spatialIndex = null;

		} );

	} );

	describe( '#_getClosestBorderEdge()', function () {

		it( 'should return the closest border edge for the given point', function () {

			const closestBorderEdge = {
				edge: null,
				closestPoint: new Vector3()
			};

			const point = new Vector3( 0.9, 0, 0.5 );
			navMesh._getClosestBorderEdge( point, closestBorderEdge );

			const region = navMesh.regions[ 1 ];
			const edge = region.edge;

			expect( closestBorderEdge.edge ).to.equal( edge );
			expect( closestBorderEdge.closestPoint ).to.deep.equal( { x: 1, y: 0, z: 0.5 } );

		} );

		it( 'should use a spatial index for computing the closest border edge', function () {

			const spatialIndex = new CellSpacePartitioning( width, height, depth, cellsX, cellsY, cellsZ );
			navMesh.spatialIndex = spatialIndex;
			navMesh.updateSpatialIndex();

			const closestBorderEdge = {
				edge: null,
				closestPoint: new Vector3()
			};

			const point = new Vector3( 0.9, 0, 0.5 );
			navMesh._getClosestBorderEdge( point, closestBorderEdge );

			const region = navMesh.regions[ 1 ];
			const edge = region.edge;

			expect( closestBorderEdge.edge ).to.equal( edge );
			expect( closestBorderEdge.closestPoint ).to.deep.equal( { x: 1, y: 0, z: 0.5 } );

			navMesh.spatialIndex = null;

		} );

	} );

	describe( '#_getPortalEdge()', function () {

		it( 'should compute a portal edge that connects the first polygon with the second one and store the result in the given object', function () {

			const polygon1 = new Polygon();
			const polygon2 = new Polygon();
			const polygon3 = new Polygon();

			const vertices1 = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0.5, 0, - 1 ),
				new Vector3( 1, 0, 0 )
			];

			const vertices2 = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 0.5, 0, 1 )
			];

			polygon1.fromContour( vertices1 );
			polygon2.fromContour( vertices2 );

			polygon1.edge.twin = polygon2.edge.next;

			const portalEdge = { left: null, right: null };

			navMesh._getPortalEdge( polygon1, polygon2, portalEdge );
			expect( portalEdge.left ).to.equal( vertices1[ 2 ] );
			expect( portalEdge.right ).to.equal( vertices1[ 0 ] );

			navMesh._getPortalEdge( polygon1, polygon3, portalEdge );
			expect( portalEdge.left ).to.be.null;
			expect( portalEdge.right ).to.be.null;

		} );

	} );

	describe( '#clear()', function () {

		it( 'should merge polygons to convex regions if possible', function () {

			navMesh.clear();
			expect( navMesh.regions ).to.be.empty;
			expect( navMesh.graph.getNodeCount() ).to.equal( 0 );
			expect( navMesh.graph.getEdgeCount() ).to.equal( 0 );
			expect( navMesh.spatialIndex ).to.be.null;

		} );

	} );

} );
