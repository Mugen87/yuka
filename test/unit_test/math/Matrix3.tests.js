/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Matrix3 = YUKA.Matrix3;
const Vector3 = YUKA.Vector3;
const Quaternion = YUKA.Quaternion;

describe( 'Matrix3', function () {

	describe( '#identity()', function () {

		it( 'should transform the matrix to an identity matrix', function () {

			const matrix = new Matrix3();
			matrix.identity();

			expect( matrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if equal else false', function () {

			const m1 = new Matrix3();
			const m2 = new Matrix3();

			expect( m1.equals( m2 ) ).to.be.true;

		} );

	} );

	describe( '#set()', function () {

		it( 'should set values of matrix', function () {

			const m1 = new Matrix3();
			m1.set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );

			expect( m1.elements ).to.deep.equal( [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should return copy of matrix', function () {

			const m1 = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const m2 = new Matrix3().copy( m1 );

			expect( m1 ).to.deep.equal( m2 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of matrix', function () {

			const m1 = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const m2 = m1.clone();

			expect( m1 ).to.deep.equal( m2 );

		} );

	} );

	describe( '#multiply()', function () {

		it( 'should return matrix multiplied with other matrix', function () {

			const m1 = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const m2 = new Matrix3().set( 29, 31, 37, 41, 43, 47, 53, 59, 61 );

			m1.multiply( m2 );

			expect( m1.elements ).to.deep.equal( [ 446, 1343, 2491, 486, 1457, 2701, 520, 1569, 2925 ] );

		} );

	} );

	describe( '#premultiply()', function () {

		it( 'should return other matrix multiplied with matrix', function () {

			const m1 = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const m2 = new Matrix3().set( 29, 31, 37, 41, 43, 47, 53, 59, 61 );

			m1.premultiply( m2 );

			expect( m1.elements ).to.deep.equal( [ 904, 1182, 1556, 1131, 1489, 1967, 1399, 1845, 2435 ] );

		} );

	} );

	describe( '#multiplyMatrices()', function () {

		it( 'should return multiplied matrix of two matrices', function () {

			const m1 = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const m2 = new Matrix3().set( 29, 31, 37, 41, 43, 47, 53, 59, 61 );
			const m3 = new Matrix3().multiplyMatrices( m1, m2 );

			expect( m3.elements ).to.deep.equal( [ 446, 1343, 2491, 486, 1457, 2701, 520, 1569, 2925 ] );

		} );

	} );

	describe( '#multiplyScalar()', function () {

		it( 'should return matrix multiplied by scalar', function () {

			const m1 = new Matrix3().multiplyScalar( 2 );

			expect( m1.elements ).to.deep.equal( [ 2, 0, 0, 0, 2, 0, 0, 0, 2 ] );

		} );

	} );

	describe( '#extractBasis()', function () {

		it( 'should put values of matrix in the three given vectors', function () {

			const v0 = new Vector3();
			const v1 = new Vector3();
			const v2 = new Vector3();
			const m1 = new Matrix3();

			m1.extractBasis( v0, v1, v2 );

			expect( v0 ).to.deep.equal( { x: 1, y: 0, z: 0 } );
			expect( v1 ).to.deep.equal( { x: 0, y: 1, z: 0 } );
			expect( v2 ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

	} );

	describe( '#makeBasis()', function () {

		it( 'should build matrix of three given vectors', function () {

			const v0 = new Vector3( - 1, 0, 0 );
			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 0, - 1 );
			const m1 = new Matrix3().makeBasis( v0, v1, v2 );

			expect( m1.elements ).to.deep.equal( [ - 1, 0, 0, 0, 1, 0, 0, 0, - 1 ] );

		} );

	} );

	describe( '#lookAt()', function () {

		it( 'should create an orthonormal basis that rotates an entity towards the given target direction', function () {

			const m1 = new Matrix3();
			const v0 = new Vector3( 0, 0, 1 );
			const v1 = new Vector3( 0, 0, - 1 );
			const v2 = new Vector3( 0, 1, 0 );

			m1.lookAt( v0, v1, v2 );

			expect( m1.elements ).to.deep.equal( [ - 1, 0, 0, 0, 1, 0, 0, 0, - 1 ] );

		} );

		it( 'should produce a valid result when target rotation is collinear to worldUp', function () {

			const m1 = new Matrix3();
			const v0 = new Vector3( 0, 0, 1 );
			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 1, 0 );

			m1.lookAt( v0, v1, v2 );

			const e = m1.elements;

			expect( e[ 0 ] ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( e[ 1 ] ).to.closeTo( 0, Number.EPSILON );
			expect( e[ 2 ] ).to.closeTo( - 0.7071067811865475, Number.EPSILON );
			expect( e[ 3 ] ).to.closeTo( - 0.7071067811865476, Number.EPSILON );
			expect( e[ 4 ] ).to.closeTo( 0, Number.EPSILON );
			expect( e[ 5 ] ).to.closeTo( - 0.7071067811865476, Number.EPSILON );
			expect( e[ 6 ] ).to.closeTo( 0, Number.EPSILON );
			expect( e[ 7 ] ).to.closeTo( 1, Number.EPSILON );
			expect( e[ 8 ] ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#transpose()', function () {

		it( 'should transpose the matrix', function () {

			const m1 = new Matrix3().set( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			m1.transpose();

			//sequence of set and elements is different
			expect( m1.elements ).to.deep.equal( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );

		} );

	} );

	describe( '#fromQuaternion()', function () {

		it( 'should create a matrix from a given quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const m1 = new Matrix3().fromQuaternion( q1 );

			expect( m1.elements ).to.deep.equal( [ - 1, 0, 0, 0, 1, 0, 0, 0, - 1 ] );

		} );

	} );

	describe( '#fromArray()', function () {

		it( 'should fill matrix with values of array', function () {

			const m1 = new Matrix3().fromArray( [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

			expect( m1.elements ).to.deep.equal( [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

		} );

	} );

	describe( '#toArray()', function () {

		it( 'should return array of matrix values', function () {

			const m1 = new Matrix3();

			expect( m1.toArray() ).to.deep.equal( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

		} );

	} );



} );
