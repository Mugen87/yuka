/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Polygon = YUKA.Polygon;
const HalfEdge = YUKA.HalfEdge;
const Vector3 = YUKA.Vector3;
const Plane = YUKA.Plane;

//

describe( 'Polygon', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const polygon = new Polygon();
			expect( polygon ).to.have.a.property( 'centroid' ).that.is.an.instanceof( Vector3 );
			expect( polygon ).to.have.a.property( 'edge' ).that.is.null;
			expect( polygon ).to.have.a.property( 'plane' ).that.is.an.instanceof( Plane );

		} );

	} );

	describe( '#fromContour()', function () {

		it( 'should create a polygon from a given sequence of points', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			let edge = polygon.edge;

			do {

				expect( edge ).to.be.an.instanceof( HalfEdge );
				expect( edge.next.prev ).to.be.equal( edge );
				expect( edge.prev.next ).to.be.equal( edge );
				expect( edge.polygon ).to.be.equal( polygon );
				expect( edge.twin ).to.be.null;

				edge = edge.next;

			} while ( edge !== polygon.edge );

		} );

		it( 'should log an error and not throw an exception when the contour has less than three points', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 )
			];

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			polygon.fromContour( vertices );

			expect( polygon.edge ).to.be.null;

		} );

	} );

	describe( '#computeCentroid()', function () {

		it( 'should compute the centroid for the polygon', function () {

			const polygon = new Polygon();
			const centroid = new Vector3( 0.5, 0, 0.5 );

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices ).computeCentroid();

			expect( polygon.centroid ).to.deep.equal( centroid );

		} );

	} );

	describe( '#contains()', function () {

		it( 'should return true if the point lies inside the polygon', function () {

			const polygon = new Polygon();
			const point = new Vector3( 0.5, 0, 0.5 );

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.contains( point ) ).to.be.true;

		} );

		it( 'should return false if the point lies outside the polygon', function () {

			const polygon = new Polygon();
			const point = new Vector3( - 0.5, 0, 0.5 );

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.contains( point ) ).to.be.false;

		} );

		it( 'should return true if the point lies inside the polygon and within the allowed tolerance range', function () {

			const polygon = new Polygon();
			const point = new Vector3( 0.5, 0.0001, 0.5 );

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.contains( point ) ).to.be.true;

		} );

		it( 'should use the epsilon parameter to adjust the allowed tolerance range', function () {

			const polygon = new Polygon();
			const point = new Vector3( 0.5, - 0.01, 0.5 );
			const epsilon = 0.02; // increase the tolerance

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.contains( point, epsilon ) ).to.be.true;

		} );

		it( 'should return false if the point lies inside the polygon and not within the allowed tolerance range', function () {

			const polygon = new Polygon();
			const point = new Vector3( 0.5, 0.0002, 0.5 );
			const epsilon = 0.0001;

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.contains( point, epsilon ) ).to.be.false;

		} );

	} );

	describe( '#convex()', function () {

		it( 'should return true if the polygon is convex', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.convex() ).to.be.true;

		} );

		it( 'should return false if the polygon is concave', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 0, 0, 1 )
			];

			polygon.fromContour( vertices );

			expect( polygon.convex() ).to.be.false;

		} );

		it( 'should return true if three consecutive vertices are collinear (area() returns zero)', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 0.5, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.convex() ).to.be.true;

		} );

		it( 'should respect the CCW parameter that allows to define the winding order', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 0, 0, 1 )
			];

			polygon.fromContour( vertices ); // normally a concave contour

			expect( polygon.convex( false ) ).to.be.true;

		} );

	} );

	describe( '#coplanar()', function () {

		it( 'should return true if all points of the polygon are coplanar', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.coplanar() ).to.be.true;

		} );

		it( 'should return false if not all points of the polygon are coplanar', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 1, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.coplanar() ).to.be.false;

		} );

		it( 'should use the epsilon parameter to increase the tolerance', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0.01, 0 )
			];

			polygon.fromContour( vertices );

			expect( polygon.coplanar() ).to.be.false;
			expect( polygon.coplanar( 0.02 ) ).to.be.true;

		} );

	} );

	describe( '#distanceToPoint()', function () {

		it( 'should compute the signed distance from the polyogn to the given point', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			const point1 = new Vector3( 0, 1, 0 );
			const point2 = new Vector3( 0, 0, 0 );
			const point3 = new Vector3( 0, - 2, 0 );

			expect( polygon.distanceToPoint( point1 ) ).to.be.equal( 1 );
			expect( polygon.distanceToPoint( point2 ) ).to.be.equal( 0 );
			expect( polygon.distanceToPoint( point3 ) ).to.be.equal( - 2 );

		} );

	} );

	describe( '#getContour()', function () {

		it( 'should return store the vertices of the polygon in the given array', function () {

			const polygon = new Polygon();

			const vertices = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0, 0, 1 ),
				new Vector3( 1, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon.fromContour( vertices );

			const result = [];

			polygon.getContour( result );

			expect( result[ 0 ] ).to.be.equal( vertices[ 0 ] );
			expect( result[ 1 ] ).to.be.equal( vertices[ 1 ] );
			expect( result[ 2 ] ).to.be.equal( vertices[ 2 ] );
			expect( result[ 3 ] ).to.be.equal( vertices[ 3 ] );

		} );

	} );

} );
