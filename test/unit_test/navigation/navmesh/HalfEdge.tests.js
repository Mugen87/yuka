/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const HalfEdge = YUKA.HalfEdge;
const Vector3 = YUKA.Vector3;

//

describe( 'HalfEdge', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge ).to.have.a.property( 'vertex' ).that.is.an.instanceof( Vector3 );
			expect( halfEdge ).to.have.a.property( 'next' ).that.is.null;
			expect( halfEdge ).to.have.a.property( 'prev' ).that.is.null;
			expect( halfEdge ).to.have.a.property( 'twin' ).that.is.null;
			expect( halfEdge ).to.have.a.property( 'polygon' ).that.is.null;
			expect( halfEdge ).to.have.a.property( 'nodeIndex' ).that.is.equal( - 1 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const vertex = new Vector3();
			const halfEdge = new HalfEdge( vertex );

			expect( halfEdge.vertex ).to.equal( vertex );

		} );

	} );

	describe( '#from()', function () {

		it( 'should return the start vertex of the half edge', function () {

			const vertex = new Vector3( 1, 1, 1 );
			const halfEdge = new HalfEdge( vertex );

			expect( halfEdge.from() ).to.equal( halfEdge.vertex );

		} );

	} );

	describe( '#to()', function () {

		it( 'should return the end vertex of the half edge (vertex of the next half edge)', function () {

			const vertex = new Vector3( 1, 1, 1 );
			const halfEdge1 = new HalfEdge();
			const halfEdge2 = new HalfEdge( vertex );

			halfEdge1.next = halfEdge2;

			expect( halfEdge1.to() ).to.equal( halfEdge2.vertex );

		} );

		it( 'should return null if the reference to the next half edge is null', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge.to() ).to.be.null;

		} );

	} );

	describe( '#length()', function () {

		it( 'should return length of the half edge (euclidean distance from start to end vertex)', function () {

			const from = new Vector3( 0, 0, 0 );
			const to = new Vector3( 0, 0, 2 );
			const halfEdge1 = new HalfEdge( from );
			const halfEdge2 = new HalfEdge( to );

			halfEdge1.next = halfEdge2;

			expect( halfEdge1.length() ).to.equal( 2 );

		} );

		it( 'should return - 1 if the reference to the next half edge is null', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge.length() ).to.equal( - 1 );

		} );

	} );

	describe( '#squaredLength()', function () {

		it( 'should return length in squared space of the half edge (squared euclidean distance from start to end vertex)', function () {

			const from = new Vector3( 0, 0, 0 );
			const to = new Vector3( 0, 0, 2 );
			const halfEdge1 = new HalfEdge( from );
			const halfEdge2 = new HalfEdge( to );

			halfEdge1.next = halfEdge2;

			expect( halfEdge1.squaredLength() ).to.equal( 4 );

		} );

		it( 'should return - 1 if the reference to the next half edge is null', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge.squaredLength() ).to.equal( - 1 );

		} );

	} );

} );
