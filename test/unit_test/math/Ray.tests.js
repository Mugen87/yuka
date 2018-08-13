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

		it( 'should return Ray with default vectors', function () {

			const r1 = new Ray();
			const v0 = new Vector3();

			expect( r1.origin ).to.deep.equal( v0 );
			expect( r1.direction ).to.deep.equal( v0 );

		} );

		it( 'should return ray with given vectors', function () {

			const r1 = new Ray( v1, v2 );

			expect( r1.origin ).to.deep.equal( v1 );
			expect( r1.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set given Vectors', function () {

			const r1 = new Ray().set( v1, v2 );

			expect( r1.origin ).to.deep.equal( v1 );
			expect( r1.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should return copy of Ray', function () {

			const r1 = new Ray( v1, v2 );
			const r2 = new Ray().copy( r1 );

			expect( r2.origin ).to.deep.equal( v1 );
			expect( r2.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of Ray', function () {

			const r1 = new Ray( v1, v2 );
			const r2 = r1.clone();

			expect( r2.origin ).to.deep.equal( v1 );
			expect( r2.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#at()', function () {

		it( 'should return Ray with start point at t', function () {

			const r1 = new Ray( v1, v2 );
			const t = 10;
			const result = new Vector3();

			r1.at( t, result );

			expect( result ).to.deep.equal( { x: 2, y: 2, z: 12 } );

		} );

	} );

	describe( '#intersectSphere()', function () {

		it( 'should return the intersection point of a ray/sphere intersection test', function () {

			const r1 = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			r1.intersectSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 9 } );

		} );

		it( 'should return an intersection point if the ray touches the sphere', function () {

			const r1 = new Ray( new Vector3( 0, 1, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			r1.intersectSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 1, z: 10 } );

		} );

		it( 'should return an intersection point if the ray starts inside the sphere', function () {

			const r1 = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3(), 1 );
			const result = new Vector3();

			r1.intersectSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

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
