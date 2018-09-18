/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const BoundingSphere = YUKA.BoundingSphere;
const Vector3 = YUKA.Vector3;

const zero3 = new Vector3( 0, 0, 0 );
const one3 = new Vector3( 1, 1, 1 );
const two3 = new Vector3( 2, 2, 2 );

describe( 'BoundingSphere', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const sphere = new BoundingSphere();
			expect( sphere.center ).to.deep.equal( zero3 );
			expect( sphere.radius ).to.equal( 0 );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const sphere = new BoundingSphere( one3, 1 );
			expect( sphere.center ).to.deep.equal( one3 );
			expect( sphere.radius ).to.equal( 1 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const sphere = new BoundingSphere();
			sphere.set( one3, 1 );
			expect( sphere.center ).to.deep.equal( one3 );
			expect( sphere.radius ).to.equal( 1 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = new BoundingSphere();

			sphere2.copy( sphere1 );

			expect( sphere1.center ).to.deep.equal( sphere2.center );
			expect( sphere1.radius ).to.equal( sphere2.radius );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = sphere1.clone();

			expect( sphere1 ).not.to.equal( sphere2 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = sphere1.clone();

			expect( sphere1.center ).to.deep.equal( sphere2.center );
			expect( sphere1.radius ).to.equal( sphere2.radius );

		} );

	} );

	describe( '#containsPoint()', function () {

		it( 'should return true if a point is inside the bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 2 );
			const point = new Vector3( 1, 0, 0 );

			expect( sphere.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return true if a point is exactly on the bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 2 );
			const point = new Vector3( 2, 0, 0 );

			expect( sphere.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return false if a point is outside bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 2 );
			const point = new Vector3( 3, 0, 0 );

			expect( sphere.containsPoint( point ) ).to.be.false;

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if two bounding spheres intersect', function () {

			const sphere1 = new BoundingSphere( zero3, 1 );
			const sphere2 = new BoundingSphere( new Vector3( 0, 1, 0 ), 1 );

			expect( sphere1.intersectsBoundingSphere( sphere2 ) ).to.be.true;

		} );

		it( 'should return true if two bounding spheres touch each other', function () {

			const sphere1 = new BoundingSphere( zero3, 1 );
			const sphere2 = new BoundingSphere( new Vector3( 0, 2, 0 ), 1 );

			expect( sphere1.intersectsBoundingSphere( sphere2 ) ).to.be.true;

		} );

		it( 'should return false if two bounding spheres do not intersect', function () {

			const sphere1 = new BoundingSphere( zero3, 1 );
			const sphere2 = new BoundingSphere( two3, 1 );

			expect( sphere1.intersectsBoundingSphere( sphere2 ) ).to.be.false;

		} );

	} );

	describe( '#equals()', function () {

		it( 'should execute a deep comparison between two objects', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = new BoundingSphere( new Vector3( 1, 1, 1 ), 1 );
			const sphere3 = new BoundingSphere( two3, 3 );

			expect( sphere1.equals( sphere2 ) ).to.be.true;
			expect( sphere1.equals( sphere3 ) ).to.be.false;

		} );

	} );

} );
