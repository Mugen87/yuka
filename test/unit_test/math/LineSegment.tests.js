/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const LineSegment = YUKA.LineSegment;
const Vector3 = YUKA.Vector3;

describe( 'LineSegment', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const lineSegment = new LineSegment();

			expect( lineSegment ).to.have.a.property( 'from' ).that.is.an.instanceof( Vector3 );
			expect( lineSegment ).to.have.a.property( 'to' ).that.is.an.instanceof( Vector3 );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment = new LineSegment( from, to );
			expect( lineSegment.from ).to.equal( from );
			expect( lineSegment.to ).to.equal( to );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment = new LineSegment();

			lineSegment.set( from, to );

			expect( lineSegment.from ).to.equal( from );
			expect( lineSegment.to ).to.equal( to );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment1 = new LineSegment( from, to );
			const lineSegment2 = new LineSegment();

			lineSegment2.copy( lineSegment1 );

			expect( lineSegment2.from ).to.deep.equal( from );
			expect( lineSegment2.to ).to.deep.equal( to );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment1 = new LineSegment( from, to );
			const lineSegment2 = lineSegment1.clone();

			expect( lineSegment2 ).not.to.equal( lineSegment1 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment1 = new LineSegment( from, to );
			const lineSegment2 = lineSegment1.clone();

			expect( lineSegment2.from ).to.deep.equal( from );
			expect( lineSegment2.to ).to.deep.equal( to );

		} );

	} );

	describe( '#closestPointToPoint()', function () {

		it( 'should compute the closest point on the line segment for a given point and store it in the given result vector', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment = new LineSegment( from, to );

			const point1 = new Vector3( 0, 0, 3 );
			const point2 = new Vector3( 0, 1, 1.5 );
			const point3 = new Vector3( 0, 2, - 1 );

			const closesPoint = new Vector3();

			lineSegment.closestPointToPoint( point1, true, closesPoint );
			expect( closesPoint ).to.deep.equal( new Vector3( 0, 0, 2 ) );

			lineSegment.closestPointToPoint( point2, true, closesPoint );
			expect( closesPoint ).to.deep.equal( new Vector3( 0, 0, 1.5 ) );

			lineSegment.closestPointToPoint( point3, true, closesPoint );
			expect( closesPoint ).to.deep.equal( new Vector3( 0, 0, 1 ) );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if both line segmens are equal else false', function () {

			const lineSegment1 = new LineSegment( new Vector3( 0, 0, 1 ), new Vector3( 0, 0, 2 ) );
			const lineSegment2 = new LineSegment( new Vector3( 0, 0, 1 ), new Vector3( 0, 0, 2 ) );
			const lineSegment3 = new LineSegment( new Vector3( 0, 1, 0 ), new Vector3( 0, 2, 0 ) );

			expect( lineSegment1.equals( lineSegment2 ) ).to.be.true;
			expect( lineSegment1.equals( lineSegment3 ) ).to.be.false;

		} );

	} );

} );
