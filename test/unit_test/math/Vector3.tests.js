/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Vector3 = YUKA.Vector3;
const x = 1, y = 2, z = 3;

describe( 'Vector3', function () {

	describe( '#add()', function () {

		it( 'should return an unaltered vector when a zero vector is added', function () {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3();
			v1.add( v0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

		it( 'should return a vector twice the size if the same vector is added', function () {

			const v1 = new Vector3( x, y, z );
			v1.add( v1 );

			expect( v1 ).to.deep.equal( { x: x * 2, y: y * 2, z: z * 2 } );

		} );

	} );

	describe( '#addScalar()', function () {

		it( 'should return an unaltered vector when adding 0', function () {

			const v1 = new Vector3( x, y, z );
			v1.addScalar( 0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );


	} );

	describe( '#addVectors()', function () {

		it( 'should return the same vector when a zero vector is added', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3();
			const v2 = new Vector3().addVectors( v1, v0 );

			expect( v2 ).to.deep.equal( { x: v1.x, y: v1.y, z: v1.z } );

		} );

		it( 'should return a vector twice the size if the same vector is added', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3().addVectors( v1, v1 );

			expect( v2 ).to.deep.equal( { x: v1.x * 2, y: v1.y * 2, z: v1.z * 2 } );

		} );

	} );
	describe( '#sub', function () {

		it( 'should return zero vector when same vector is subtracted', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3();

			v1.sub( v1 );

			expect( v1 ).to.deep.equal( { x: v2.x, y: v2.y, z: v2.z } );

		} );

	} );

	describe( '#subScalar()', function () {

		it( 'should return an unaltered vector when subbing 0', function () {

			const v1 = new Vector3( x, y, z );
			v1.subScalar( 0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );


	} );


	describe( '#subVectors()', function () {

		it( 'should return the same vector when a zero vector is subbed', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3();
			const v2 = new Vector3().subVectors( v1, v0 );

			expect( v2 ).to.deep.equal( { x: v1.x, y: v1.y, z: v1.z } );

		} );


	} );

	describe( '#multiply()', function () {

		it( 'should return product of vector multiplication', function () {

        	const v1 = new Vector3( x, y, z );
        	const v2 = new Vector3( x, y, z );

        	v1.multiply( v2 );

        	expect( v1 ).to.deep.equal( { x: Math.pow( v2.x, 2 ), y: Math.pow( v2.y, 2 ), z: Math.pow( v2.z, 2 ) } );

		} );

	} );

	describe( '#multiplyScalar()', function () {

		it( 'should return unaltered vector when multiplying with 1', function () {

			const v1 = new Vector3( x, y, z );
			v1.multiplyScalar( 1 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#multiplyVectors()', function () {

		it( 'should return product of vector multiplication', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3().multiplyVectors( v1, v1 );

			expect( v2 ).to.deep.equal( { x: Math.pow( v1.x, 2 ), y: Math.pow( v1.y, 2 ), z: Math.pow( v1.z, 2 ) } );

		} );

	} );

	describe( '#divide()', function () {

		it( 'should return unaltered vector when dviding with vector1', function () {

        	const v1 = new Vector3( x, y, z );
        	const v2 = new Vector3( 1, 1, 1 );

        	v1.divide( v2 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

} );
