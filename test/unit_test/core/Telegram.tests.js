/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Telegram = YUKA.Telegram;

describe( 'Telegram', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const telegram = new Telegram();
			expect( telegram ).to.have.a.property( 'sender' );
			expect( telegram ).to.have.a.property( 'receiver' );
			expect( telegram ).to.have.a.property( 'message' );
			expect( telegram ).to.have.a.property( 'delay' );
			expect( telegram ).to.have.a.property( 'data' );

		} );

	} );

} );
