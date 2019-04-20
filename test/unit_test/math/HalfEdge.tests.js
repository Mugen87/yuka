/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

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

		} );

		it( 'should apply the parameters to the new object', function () {

			const vertex = new Vector3();
			const halfEdge = new HalfEdge( vertex );

			expect( halfEdge.vertex ).to.equal( vertex );

		} );

	} );

	describe( '#tail()', function () {

		it( 'should return the start vertex of the half edge (vertex of the prev half edge)', function () {

			const vertex = new Vector3( 1, 1, 1 );
			const halfEdge1 = new HalfEdge();
			const halfEdge2 = new HalfEdge( vertex );

			halfEdge1.prev = halfEdge2;

			expect( halfEdge1.tail() ).to.equal( halfEdge2.vertex );

		} );

		it( 'should return null if the reference to the prev half edge is null', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge.tail() ).to.be.null;

		} );

	} );

	describe( '#head()', function () {

		it( 'should return the end vertex of the half edge', function () {

			const vertex = new Vector3( 1, 1, 1 );
			const halfEdge = new HalfEdge( vertex );

			expect( halfEdge.head() ).to.equal( halfEdge.vertex );

		} );

	} );

	describe( '#length()', function () {

		it( 'should return length of the half edge (euclidean distance from start to end vertex)', function () {

			const halfEdge1 = new HalfEdge( new Vector3( 0, 0, 2 ) );
			const halfEdge2 = new HalfEdge( new Vector3( 0, 0, 0 ) );

			halfEdge1.prev = halfEdge2;

			expect( halfEdge1.length() ).to.equal( 2 );

		} );

		it( 'should return - 1 if the reference to the prev half edge is null', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge.length() ).to.equal( - 1 );

		} );

	} );

	describe( '#squaredLength()', function () {

		it( 'should return length in squared space of the half edge (squared euclidean distance from start to end vertex)', function () {

			const halfEdge1 = new HalfEdge( new Vector3( 0, 0, 2 ) );
			const halfEdge2 = new HalfEdge( new Vector3( 0, 0, 0 ) );

			halfEdge1.prev = halfEdge2;

			expect( halfEdge1.squaredLength() ).to.equal( 4 );

		} );

		it( 'should return - 1 if the reference to the prev half edge is null', function () {

			const halfEdge = new HalfEdge();

			expect( halfEdge.squaredLength() ).to.equal( - 1 );

		} );

	} );

	describe( '#linkOpponent()', function () {

		it( 'should link the given opponent edge to this one', function () {

			const halfEdge1 = new HalfEdge();
			const halfEdge2 = new HalfEdge();

			halfEdge1.linkOpponent( halfEdge2 );

			expect( halfEdge1.twin ).to.equal( halfEdge2 );
			expect( halfEdge2.twin ).to.equal( halfEdge1 );

		} );

	} );

	describe( '#getDirection()', function () {

		it( 'should compute the direction of this half edge and store it in the given vector', function () {

			const halfEdge1 = new HalfEdge( new Vector3( 0, 0, 2 ) );
			const halfEdge2 = new HalfEdge( new Vector3( 0, 0, 0 ) );
			halfEdge1.prev = halfEdge2;

			const direction = new Vector3();
			halfEdge1.getDirection( direction );

			expect( direction ).to.deep.equal( new Vector3( 0, 0, 1 ) );

		} );

	} );

} );
