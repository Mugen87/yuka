/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const _Math = YUKA.Math;

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

} );
