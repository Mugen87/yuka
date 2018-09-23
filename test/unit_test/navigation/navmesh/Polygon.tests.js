/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const Polygon = YUKA.Polygon;
const HalfEdge = YUKA.HalfEdge;
const Vector3 = YUKA.Vector3;

//

describe( 'Polygon', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const polygon = new Polygon();
			expect( polygon ).to.have.a.property( 'edge' ).that.is.null;

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

	describe( '#getPortalEdgeTo()', function () {

		it( 'should return determine a portal edge that connects this polygon with the given one and store the result in the given object', function () {

			const polygon1 = new Polygon();
			const polygon2 = new Polygon();
			const polygon3 = new Polygon();

			const vertices1 = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 1, 0, 0 ),
				new Vector3( 0.5, 0, - 1 ),
			];

			const vertices2 = [
				new Vector3( 0, 0, 0 ),
				new Vector3( 0.5, 0, 1 ),
				new Vector3( 1, 0, 0 )
			];

			polygon1.fromContour( vertices1 );
			polygon2.fromContour( vertices2 );

			polygon1.edge.twin = polygon2.edge.prev;

			const portalEdge = { left: null, right: null };

			polygon1.getPortalEdgeTo( polygon2, portalEdge );
			expect( portalEdge.left ).to.equal( vertices1[ 0 ] );
			expect( portalEdge.right ).to.equal( vertices1[ 1 ] );

			polygon1.getPortalEdgeTo( polygon3, portalEdge );
			expect( portalEdge.left ).to.be.null;
			expect( portalEdge.right ).to.be.null;

		} );

	} );

} );
