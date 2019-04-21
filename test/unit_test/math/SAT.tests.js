/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const SAT = YUKA.SAT;
const ConvexHull = YUKA.ConvexHull;
const Vector3 = YUKA.Vector3;

const points1 = [
	new Vector3( 1, 1, 1 ),
	new Vector3( 4, - 1, 4 ),
	new Vector3( 3, 6, - 3 ),
	new Vector3( - 7, - 5, 0 ),
	new Vector3( 2, 9, 19 ),
	new Vector3( 7, 4, 8 ),
	new Vector3( 14, - 14, 2 ),
	new Vector3( - 9, 1, 11 ),
	new Vector3( 0, 14, - 8 )
];

describe( 'SAT', function () {

	describe( '#intersects()', function () {

		it( 'should return true if the given convex polyhedra intersect', function () {

			const points2 = [
				new Vector3( 7, 7, 7 ),
				new Vector3( 7, 7, 5 ),
				new Vector3( 7, 5, 7 ),
				new Vector3( 7, 5, 5 ),
				new Vector3( 5, 7, 7 ),
				new Vector3( 5, 7, 5 ),
				new Vector3( 5, 5, 7 ),
				new Vector3( 5, 5, 5 )
			];

			const convexHull1 = new ConvexHull().fromPoints( points1 );
			const convexHull2 = new ConvexHull().fromPoints( points2 ); // overlapping convexHull1

			const sat = new SAT();

			expect( sat.intersects( convexHull1, convexHull2 ) ).to.be.true;

		} );

		it( 'should return true if the given one convex polyhedra is completely contained in the other one', function () {

			const points2 = [
				new Vector3( 1, 1, 1 ),
				new Vector3( 1, 1, - 1 ),
				new Vector3( 1, - 1, 1 ),
				new Vector3( 1, - 1, - 1 ),
				new Vector3( - 1, 1, 1 ),
				new Vector3( - 1, 1, - 1 ),
				new Vector3( - 1, - 1, 1 ),
				new Vector3( - 1, - 1, - 1 )
			];

			const convexHull1 = new ConvexHull().fromPoints( points1 );
			const convexHull2 = new ConvexHull().fromPoints( points2 ); // fully enclosed in convexHull1

			const sat = new SAT();

			expect( sat.intersects( convexHull1, convexHull2 ) ).to.be.true;

		} );

		it( 'should return false if the convex polyhedra do not intersect (AB test)', function () {

			const points2 = [
				new Vector3( 10, 10, 10 ),
				new Vector3( 10, 10, 8 ),
				new Vector3( 10, 8, 10 ),
				new Vector3( 10, 8, 8 ),
				new Vector3( 8, 10, 10 ),
				new Vector3( 8, 10, 8 ),
				new Vector3( 8, 8, 10 ),
				new Vector3( 8, 8, 8 )
			];

			const convexHull1 = new ConvexHull().fromPoints( points1 );
			const convexHull2 = new ConvexHull().fromPoints( points2 );

			const sat = new SAT();

			expect( sat.intersects( convexHull1, convexHull2 ) ).to.be.false;

		} );

		it( 'should return false if the convex polyhedra do not intersect (BA test)', function () {

			const points2 = [
				new Vector3( 20, 18, 20 ),
				new Vector3( 20, 18, - 20 ),
				new Vector3( 20, 16, 20 ),
				new Vector3( 20, 16, - 20 ),
				new Vector3( - 20, 18, 20 ),
				new Vector3( - 20, 18, - 20 ),
				new Vector3( - 20, 16, 20 ),
				new Vector3( - 20, 16, - 20 )
			];

			const convexHull1 = new ConvexHull().fromPoints( points1 );
			const convexHull2 = new ConvexHull().fromPoints( points2 );

			const sat = new SAT();

			expect( sat.intersects( convexHull1, convexHull2 ) ).to.be.false;

		} );

		it( 'should return false if the convex polyhedra do not intersect (edge test)', function () {

			const points2 = [
				new Vector3( 2, 14, 5 ),
				new Vector3( 2, 14, 6 ),
				new Vector3( 2, 12, 5 ),
				new Vector3( 2, 12, 6 ),
				new Vector3( 0, 14, 5 ),
				new Vector3( 0, 14, 6 ),
				new Vector3( 0, 12, 5 ),
				new Vector3( 0, 12, 6 )
			];

			const convexHull1 = new ConvexHull().fromPoints( points1 );
			const convexHull2 = new ConvexHull().fromPoints( points2 );

			const sat = new SAT();

			expect( sat.intersects( convexHull1, convexHull2 ) ).to.be.false;

		} );

	} );

	describe( '#_distanceBetweenEdges()', function () {

		it( 'should return - Infinity if the given edge directions are parallel', function () {

			const sat = new SAT();

			expect( sat._distanceBetweenEdges( new Vector3(), new Vector3( 0, 1, 0 ), new Vector3(), new Vector3( 0, 1, 0 ) ) ).to.equal( - Infinity );
			expect( sat._distanceBetweenEdges( new Vector3(), new Vector3( 0, 1, 0 ), new Vector3(), new Vector3( 0, - 1, 0 ) ) ).to.equal( - Infinity );

		} );

	} );

} );
