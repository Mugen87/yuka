/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Polyhedron = YUKA.Polyhedron;
const Polygon = YUKA.Polygon;
const Vector3 = YUKA.Vector3;

// use a simple cube with six faces as a polyhedron

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
	vertices[ 3 ],
	vertices[ 1 ],
	vertices[ 0 ],
	vertices[ 2 ]
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

polyhedron.faces.push( sideTop, sideRight, sideFront, sideBack, sideBottom, sideLeft );

describe( 'Polyhedron', function () {


	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const polyhedron = new Polyhedron();
			expect( polyhedron ).to.have.a.property( 'faces' ).that.is.an( 'array' );
			expect( polyhedron ).to.have.a.property( 'edges' ).that.is.an( 'array' );
			expect( polyhedron ).to.have.a.property( 'centroid' ).that.is.an.instanceof( Vector3 );

		} );

	} );

	describe( '#computeCentroid()', function () {

		it( 'should compute the centroid of this polyhedron', function () {

			polyhedron.computeCentroid();

			expect( polyhedron.centroid ).to.deep.equal( new Vector3( 0, 0, 0 ) );

		} );

	} );

	describe( '#computeUniqueVerticesAndEdges()', function () {

		it( 'should compute unique vertices and edges of this polyhedron', function () {

			polyhedron.computeUniqueVerticesAndEdges();

			expect( polyhedron.edges ).to.have.lengthOf( 24 ); // because there are no twin references
			expect( polyhedron.vertices ).to.have.lengthOf( 8 );

			// set some twin references

			sideFront.edge.linkOpponent( sideRight.edge );
			sideBack.edge.linkOpponent( sideLeft.edge );

			polyhedron.computeUniqueVerticesAndEdges();

			expect( polyhedron.edges ).to.have.lengthOf( 22 ); // because 2 twin edges are discared
			expect( polyhedron.vertices ).to.have.lengthOf( 8 );

		} );

	} );

} );
