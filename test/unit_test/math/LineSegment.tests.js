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

	describe( '#delta()', function () {

		it( 'should calculate the difference vector between from and to and write the result to the given vector', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );
			const result = new Vector3();

			const lineSegment = new LineSegment( from, to );
			lineSegment.delta( result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

	} );

	describe( '#at()', function () {

		it( 'should use the given scalar value to calculate a point on the line segment and write the result to the given vector', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );
			const result = new Vector3();

			const lineSegment = new LineSegment( from, to );

			// range [0,1] lies on the line segment

			lineSegment.at( 0, result );
			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

			lineSegment.at( 0.5, result );
			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1.5 } );

			lineSegment.at( 1, result );
			expect( result ).to.deep.equal( { x: 0, y: 0, z: 2 } );

			// t values outside the range are valid and produce values

			lineSegment.at( 2, result );
			expect( result ).to.deep.equal( { x: 0, y: 0, z: 3 } );

			lineSegment.at( - 1, result );
			expect( result ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#closestPointToPointParameter()', function () {

		it( 'should return a scalar value which indicates the position of the point on the line segment', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );
			let t;

			const lineSegment = new LineSegment( from, to );

			const point1 = new Vector3( 0, 0, 3 );
			const point2 = new Vector3( 0, 1, 1.5 );
			const point3 = new Vector3( 0, 2, - 1 );

			t = lineSegment.closestPointToPointParameter( point1 );
			expect( t ).to.equal( 1 );

			t = lineSegment.closestPointToPointParameter( point2 );
			expect( t ).to.equal( 0.5 );

			t = lineSegment.closestPointToPointParameter( point3 );
			expect( t ).to.equal( 0 );

		} );

		it( 'should use the second parameter to return t values greater than zero and one', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );
			let t;

			const lineSegment = new LineSegment( from, to );

			const point1 = new Vector3( 0, 0, 3 );
			const point2 = new Vector3( 0, 1, 1.5 );
			const point3 = new Vector3( 0, 2, 0 );

			t = lineSegment.closestPointToPointParameter( point1, false );
			expect( t ).to.equal( 2 );

			t = lineSegment.closestPointToPointParameter( point2, false );
			expect( t ).to.equal( 0.5 );

			t = lineSegment.closestPointToPointParameter( point3, false );
			expect( t ).to.equal( - 1 );

		} );

	} );

	describe( '#closestPointToPoint()', function () {

		it( 'should call closestPointToPointParameter() and create a point from the computed t value', function () {

			const from = new Vector3( 0, 0, 1 );
			const to = new Vector3( 0, 0, 2 );

			const lineSegment = new LineSegment( from, to );

			const point1 = new Vector3( 0, 0, 3 );
			const point2 = new Vector3( 0, 1, 1.5 );
			const point3 = new Vector3( 0, 2, - 1 );

			const closesPoint = new Vector3();

			lineSegment.closestPointToPoint( point1, false, closesPoint );
			expect( closesPoint ).to.deep.equal( new Vector3( 0, 0, 3 ) );

			lineSegment.closestPointToPoint( point2, true, closesPoint );
			expect( closesPoint ).to.deep.equal( new Vector3( 0, 0, 1.5 ) );

			lineSegment.closestPointToPoint( point3, true, closesPoint );
			expect( closesPoint ).to.deep.equal( new Vector3( 0, 0, 1 ) );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if both line segments are equal else false', function () {

			const lineSegment1 = new LineSegment( new Vector3( 0, 0, 1 ), new Vector3( 0, 0, 2 ) );
			const lineSegment2 = new LineSegment( new Vector3( 0, 0, 1 ), new Vector3( 0, 0, 2 ) );
			const lineSegment3 = new LineSegment( new Vector3( 0, 1, 0 ), new Vector3( 0, 2, 0 ) );

			expect( lineSegment1.equals( lineSegment2 ) ).to.be.true;
			expect( lineSegment1.equals( lineSegment3 ) ).to.be.false;

		} );

	} );

} );
