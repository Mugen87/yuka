/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.min.js' );

const AABB = YUKA.AABB;
const BoundingSphere = YUKA.BoundingSphere;
const Vector3 = YUKA.Vector3;

const zero3 = new Vector3( 0, 0, 0 );
const one3 = new Vector3( 1, 1, 1 );
const two3 = new Vector3( 2, 2, 2 );

describe( 'AABB', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const aabb = new AABB();
			expect( aabb.min ).to.deep.equal( zero3 );
			expect( aabb.max ).to.deep.equal( zero3 );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const aabb = new AABB( one3, two3 );
			expect( aabb.min ).to.deep.equal( one3 );
			expect( aabb.max ).to.deep.equal( two3 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const aabb = new AABB();
			aabb.set( one3, two3 );
			expect( aabb.min ).to.deep.equal( one3 );
			expect( aabb.max ).to.deep.equal( two3 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = new AABB();

			aabb2.copy( aabb1 );

			expect( aabb1.min ).to.deep.equal( aabb2.min );
			expect( aabb1.max ).to.deep.equal( aabb2.max );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = aabb1.clone();

			expect( aabb1 ).not.to.equal( aabb2 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = aabb1.clone();

			expect( aabb1.min ).to.deep.equal( aabb2.min );
			expect( aabb1.max ).to.deep.equal( aabb2.max );

		} );

	} );

	describe( '#clampPoint()', function () {

		it( 'should clamp a point so it does not exceed the boundaries of the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, - 4, 2 );
			const result = new Vector3();

			aabb.clampPoint( point, result );

			expect( result ).to.deep.equal( new Vector3( 0.5, 0, 1 ) );

		} );

	} );

	describe( '#containsPoint()', function () {

		it( 'should return true if a point is inside the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, 0.5, 0.5 );

			expect( aabb.containsPoint( point ) ).to.equal( true );

		} );

		it( 'should return true if a point is exactly on the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, 0.5, 1 );

			expect( aabb.containsPoint( point ) ).to.equal( true );

		} );

		it( 'should return false if a point is outside AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, 0.5, 2 );

			expect( aabb.containsPoint( point ) ).to.equal( false );

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if a bounding sphere intersects the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const sphere = new BoundingSphere( one3, 1 );

			expect( aabb.intersectsBoundingSphere( sphere ) ).to.equal( true );

		} );

		it( 'should return true if a bounding sphere touches the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const sphere = new BoundingSphere( new Vector3( 0.5, 0.5, 1.5 ), 0.5 );

			expect( aabb.intersectsBoundingSphere( sphere ) ).to.equal( true );

		} );

		it( 'should return false if a bounding sphere does not intersect the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const sphere = new BoundingSphere( new Vector3( 0.5, 0.5, 1.5 ), 0.4 );

			expect( aabb.intersectsBoundingSphere( sphere ) ).to.equal( false );

		} );

	} );

	describe( '#fromCenterAndSize()', function () {

		it( 'should set the min and max vector of the AABB according to the given parameter', function () {

			const center = new Vector3( 0, 2, 0 );
			const size = new Vector3( 1, 0.5, 1 );
			const aabb = new AABB().fromCenterAndSize( center, size );

			expect( aabb.min ).to.deep.equal( new Vector3( - 0.5, 1.75, - 0.5 ) );
			expect( aabb.max ).to.deep.equal( new Vector3( 0.5, 2.25, 0.5 ) );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should execute a deep comparison between two objects', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = new AABB( new Vector3( 1, 1, 1 ), two3 );
			const aabb3 = new AABB( zero3, one3 );

			expect( aabb1.equals( aabb2 ) ).to.equal( true );
			expect( aabb1.equals( aabb3 ) ).to.equal( false );

		} );

	} );

} );
