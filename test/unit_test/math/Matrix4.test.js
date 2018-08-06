/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Matrix4 = YUKA.Matrix4;
const Vector3 = YUKA.Vector3;
const Quaternion = YUKA.Quaternion;

describe( 'Matrix4', function () {

	describe( '#identity()', function () {

		it( 'should transform the matrix to an identity matrix', function () {

			const matrix = new Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			matrix.identity();

			expect( matrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if equal else false', function () {

			const m1 = new Matrix4();
			const m2 = new Matrix4();

			expect( m1.equals( m2 ) ).to.be.equal( true );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set values of matrix', function () {

			const m1 = new Matrix4();
			m1.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

			expect( m1 ).to.deep.equal( { elements: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] } );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should return copy of matrix', function () {

			const m1 = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const m2 = new Matrix4().copy( m1 );

			expect( m1 ).to.deep.equal( m2 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of matrix', function () {

			const m1 = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const m2 = m1.clone();

			expect( m1 ).to.deep.equal( m2 );

		} );

	} );

	describe( '#multiply()', function () {

		it( 'should return matrix multiplied with other matrix', function () {

			const m1 = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const m2 = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );
			const r1 = new Matrix4().set( 1585, 1655, 1787, 1861, 5318, 5562, 5980, 6246, 10514, 11006, 11840, 12378, 15894, 16634, 17888, 18710 );

			m1.multiply( m2 );
			expect( m1 ).to.deep.equal( r1 );

		} );

	} );

	describe( '#premultiply()', function () {

		it( 'should return other matrix multiplied with matrix', function () {

			const m1 = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const m2 = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const r1 = [ 90, 202, 314, 426, 100, 228, 356, 484, 110, 254, 398, 542, 120, 280, 440, 600 ];

			m1.premultiply( m2 );

			expect( m1 ).to.deep.equal( { elements: r1 } );

		} );

	} );

	describe( '#multiplyMatrices()', function () {

		it( 'should return multiplied matrix of two matrices', function () {

			const m1 = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const m2 = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );
			const r1 = new Matrix4().set( 1585, 1655, 1787, 1861, 5318, 5562, 5980, 6246, 10514, 11006, 11840, 12378, 15894, 16634, 17888, 18710 );
			const m3 = new Matrix4().multiplyMatrices( m1, m2 );

			expect( m3 ).to.deep.equal( r1 );

		} );

	} );

	describe( '#multiplyScalar()', function () {

		it( 'should return matrix multiplied by scalar', function () {

			const m1 = new Matrix4().multiplyScalar( 1 );

			expect( m1 ).to.deep.equal( new Matrix4() );

		} );

	} );

	describe( '#extractBasis()', function () {

		it( 'should put values of matrix in the three given vectors', function () {

			const v0 = new Vector3();
			const v1 = new Vector3();
			const v2 = new Vector3();
			const m1 = new Matrix4();

			m1.extractBasis( v0, v1, v2 );

			expect( v0 ).to.deep.equal( { x: 1, y: 0, z: 0 } );
			expect( v1 ).to.deep.equal( { x: 0, y: 1, z: 0 } );
			expect( v2 ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

	} );

	describe( '#makeBasis()', function () {

		it( 'should build matrix of three given vectors', function () {

			const v0 = new Vector3( 1, 0, 0 );
			const v1 = new Vector3( 0, 0, 0 );
			const v2 = new Vector3( 0, 0, 0 );
			const m1 = new Matrix4().makeBasis( v0, v1, v2 );

			expect( m1 ).to.deep.equal( { elements: [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ] } );

		} );

	} );


	describe( '#transpose()', function () {

		it( 'should transpose matrix', function () {

			const m1 = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			m1.transpose();
			//sequence of set and elements is different
			expect( m1 ).to.deep.equal( { elements: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] } );

		} );

	} );

	describe( '#getInverse()', function () {

		it( 'should return inverse of matrix or identity if det is 0', function () {

			const m1 = new Matrix4().set( 1, 1, 1, - 1, 1, 1, - 1, 1, 1, - 1, 1, 1, - 1, 1, 1, 1 );
			const m2 = new Matrix4().getInverse( m1 );

			expect( m2 ).to.deep.equal( m1.multiplyScalar( 0.25 ) );

			const m3 = new Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			m2.getInverse( m3 );

			expect( m2 ).to.deep.equal( new Matrix4() );

		} );

	} );

	describe( '#fromQuaternion()', function () {

		it( 'spec name', function () {

			const q1 = new Quaternion( 1, 2, 3, 4 );
			const m1 = new Matrix4().fromQuaternion( q1 );

			expect( m1 ).to.deep.equal( { elements: [ - 25, 28, - 10, 0, - 20, - 19, 20, 0, 22, 4, - 9, 0, 0, 0, 0, 1 ] } );

		} );

	} );

	describe( '#fromArray()', function () {

		it( 'should fill matrix with values of array', function () {

			const m1 = new Matrix4().fromArray( [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

			expect( m1 ).to.deep.equal( { elements: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] } );

		} );

	} );

	describe( '#toArray()', function () {

		it( 'should return array of matrix values', function () {

			const m1 = new Matrix4();

			expect( m1.toArray() ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );

		} );

	} );

} );

