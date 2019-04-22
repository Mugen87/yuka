/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const AABB = YUKA.AABB;
const Polyhedron = YUKA.Polyhedron;
const Polygon = YUKA.Polygon;
const Vector3 = YUKA.Vector3;

// use a simple cube with six faces as a polyhedron

//    5-------1
//   /|      /|
//  / |     / |
// 4--|----0  |
// |  7----|--3
// | /     | /
// 6-------2

const vertices = [
	new Vector3( 1, 1, 1 ), // 0
	new Vector3( 1, 1, - 1 ), // 1
	new Vector3( 1, - 1, 1 ), // 2
	new Vector3( 1, - 1, - 1 ), // 3
	new Vector3( - 1, 1, 1 ), // 4
	new Vector3( - 1, 1, - 1 ), // 5
	new Vector3( - 1, - 1, 1 ), // 6
	new Vector3( - 1, - 1, - 1 ) // 7
];

const polyhedron = new Polyhedron();

const sideTop = new Polygon().fromContour( [
	vertices[ 4 ],
	vertices[ 0 ],
	vertices[ 1 ],
	vertices[ 5 ]
] );

const sideRight = new Polygon().fromContour( [
	vertices[ 2 ],
	vertices[ 3 ],
	vertices[ 1 ],
	vertices[ 0 ]
] );

const sideFront = new Polygon().fromContour( [
	vertices[ 6 ],
	vertices[ 2 ],
	vertices[ 0 ],
	vertices[ 4 ]
] );

const sideBack = new Polygon().fromContour( [
	vertices[ 3 ],
	vertices[ 7 ],
	vertices[ 5 ],
	vertices[ 1 ]
] );

const sideBottom = new Polygon().fromContour( [
	vertices[ 3 ],
	vertices[ 2 ],
	vertices[ 6 ],
	vertices[ 7 ]
] );

const sideLeft = new Polygon().fromContour( [
	vertices[ 7 ],
	vertices[ 6 ],
	vertices[ 4 ],
	vertices[ 5 ]
] );

// link edges

sideTop.edge.linkOpponent( sideLeft.edge.prev );
sideTop.edge.next.linkOpponent( sideFront.edge.prev );
sideTop.edge.next.next.linkOpponent( sideRight.edge.prev );
sideTop.edge.prev.linkOpponent( sideBack.edge.prev );

sideBottom.edge.linkOpponent( sideBack.edge.next );
sideBottom.edge.next.linkOpponent( sideRight.edge.next );
sideBottom.edge.next.next.linkOpponent( sideFront.edge.next );
sideBottom.edge.prev.linkOpponent( sideLeft.edge.next );

sideLeft.edge.linkOpponent( sideBack.edge.next.next );
sideBack.edge.linkOpponent( sideRight.edge.next.next );
sideRight.edge.linkOpponent( sideFront.edge.next.next );
sideFront.edge.linkOpponent( sideLeft.edge.next.next );

polyhedron.faces.push( sideTop, sideRight, sideFront, sideBack, sideBottom, sideLeft );

describe( 'Polyhedron', function () {


	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const polyhedron = new Polyhedron();
			expect( polyhedron ).to.have.a.property( 'faces' ).that.is.an( 'array' );
			expect( polyhedron ).to.have.a.property( 'edges' ).that.is.an( 'array' );
			expect( polyhedron ).to.have.a.property( 'vertices' ).that.is.an( 'array' );
			expect( polyhedron ).to.have.a.property( 'centroid' ).that.is.an.instanceof( Vector3 );

		} );

	} );

	describe( '#computeCentroid()', function () {

		it( 'should compute the centroid of this polyhedron', function () {

			polyhedron.computeCentroid();

			expect( polyhedron.centroid ).to.deep.equal( new Vector3( 0, 0, 0 ) );

		} );

	} );

	describe( '#computeUniqueEdges()', function () {

		it( 'should compute unique edges of this polyhedron', function () {

			polyhedron.computeUniqueEdges();

			expect( polyhedron.edges ).to.have.lengthOf( 12 );

		} );

	} );

	describe( '#computeUniqueVertices()', function () {

		it( 'should compute unique vertices of this polyhedron', function () {

			polyhedron.computeUniqueVertices();

			expect( polyhedron.vertices ).to.have.lengthOf( 8 );

		} );

	} );

	describe( '#fromAABB()', function () {

		it( 'should create a polyhedron from the given AABB', function () {

			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 1, 0 ), new Vector3( 2, 2, 2 ) );
			const polyAABB = new Polyhedron().fromAABB( aabb );

			expect( polyAABB.faces ).to.have.lengthOf( 6 );
			expect( polyAABB.edges ).to.have.lengthOf( 12 );
			expect( polyAABB.vertices ).to.have.lengthOf( 8 );

			expect( polyAABB.centroid ).to.deep.equal( new Vector3( 0, 1, 0 ) );

		} );

	} );

} );
