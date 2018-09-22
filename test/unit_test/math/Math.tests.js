/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const _Math = YUKA.Math;
const Vector3 = YUKA.Vector3;

describe( 'Math', function () {

	describe( '#clamp()', function () {

		it( 'should clamp a number between two values', function () {

			expect( _Math.clamp( 4, 6, 8 ) ).to.deep.equal( 6 );
			expect( _Math.clamp( 7, 6, 8 ) ).to.deep.equal( 7 );
			expect( _Math.clamp( 10, 6, 8 ) ).to.deep.equal( 8 );

		} );

	} );

	describe( '#randFloat()', function () {

		it( 'should return a random number between two float values', function () {

			expect( _Math.randFloat( 4, 6 ) ).to.be.within( 4, 6 );
			expect( _Math.randFloat( - 2, - 1 ) ).to.be.within( - 2, - 1 );

		} );

	} );

	describe( '#area()', function () {

		it( 'should return the signed area of a rectangle (triangle * 2) defined by three points', function () {

			const v1 = new Vector3( 0, 0, 0 );
			const v2 = new Vector3( 2, 0, 0 );
			const v3 = new Vector3( 2, 0, - 2 );

			expect( _Math.area( v1, v2, v3 ) ).to.equal( 4 );

		} );

	} );

} );
