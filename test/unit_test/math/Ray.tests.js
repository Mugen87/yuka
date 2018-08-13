/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Ray = YUKA.Ray;
const Vector3 = YUKA.Vector3;
const BoundingSphere = YUKA.BoundingSphere;

const v1 = new Vector3( 2, 2, 2 );
const v2 = new Vector3( 0, 0, 1 );

describe( 'Ray', function () {

	describe( '#constructor', function () {

		it( 'should return ray with default parameters', function () {

			const ray = new Ray();
			const v0 = new Vector3();

			expect( ray.origin ).to.deep.equal( v0 );
			expect( ray.direction ).to.deep.equal( v0 );

		} );

		it( 'should return ray with given parameters', function () {

			const ray = new Ray( v1, v2 );

			expect( ray.origin ).to.deep.equal( v1 );
			expect( ray.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set given parameters to ray', function () {

			const ray = new Ray().set( v1, v2 );

			expect( ray.origin ).to.deep.equal( v1 );
			expect( ray.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy a given ray to the current instance', function () {

			const r1 = new Ray( v1, v2 );
			const r2 = new Ray().copy( r1 );

			expect( r2.origin ).to.deep.equal( v1 );
			expect( r2.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of the ray', function () {

			const r1 = new Ray( v1, v2 );
			const r2 = r1.clone();

			expect( r2.origin ).to.deep.equal( v1 );
			expect( r2.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#at()', function () {

		it( 'should fill the result vector with a position on the ray based on the given t parameter', function () {

			const ray = new Ray( v1, v2 );
			const t = 10;
			const result = new Vector3();

			ray.at( t, result );

			expect( result ).to.deep.equal( { x: 2, y: 2, z: 12 } );

		} );

	} );

	describe( '#intersectSphere()', function () {

		it( 'should fill the given result vector with the intersection point of a ray/sphere intersection test', function () {

			const ray = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			ray.intersectSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 9 } );

		} );

		it( 'should fill the given result vector with the intersection point if the ray touches the sphere', function () {

			const ray = new Ray( new Vector3( 0, 1, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			ray.intersectSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 1, z: 10 } );

		} );

		it( 'should fill the given result vector with the intersection point if the ray starts inside the sphere', function () {

			const ray = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3(), 1 );
			const result = new Vector3();

			ray.intersectSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should return null to indicate no intersection', function () {

			const ray = new Ray( new Vector3( 0, 10, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			expect( ray.intersectSphere( sphere, result ) ).to.be.null;

		} );

		it( 'should return null to indicate no intersection (ray starts behind sphere)', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			expect( ray.intersectSphere( sphere, result ) ).to.be.null;

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if equal else false', function () {

			const r1 = new Ray();
			const r2 = new Ray( v1, v2 );

			expect( r1.equals( new Ray() ) ).to.be.true;
			expect( r1.equals( r2 ) ).to.be.false;

		} );

	} );

} );
