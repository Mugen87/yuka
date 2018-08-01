const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.min.js' );

const Matrix3 = YUKA.Matrix3;

describe( 'Matrix3', function () {

	describe( '#identity()', function () {

  	it( 'should transform the matrix to an identity matrix', function () {

			const matrix = new Matrix3();
			matrix.identity();

			expect( matrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

		} );

	} );

} );
