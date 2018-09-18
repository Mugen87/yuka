/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const State = YUKA.State;

describe( 'State', function () {

	describe( '#enter()', function () {

		it( 'should exist', function () {

			const state = new State();
			expect( state ).respondTo( 'enter' );
			state.enter();

		} );

	} );

	describe( '#execute()', function () {

		it( 'should exist', function () {

			const state = new State();
			expect( state ).respondTo( 'execute' );
			state.execute();

		} );

	} );

	describe( '#exit()', function () {

		it( 'should exist', function () {

			const state = new State();
			expect( state ).respondTo( 'exit' );
			state.exit();

		} );

	} );

	describe( '#onMessage()', function () {

		it( 'should exist', function () {

			const state = new State();
			expect( state ).respondTo( 'onMessage' );

		} );

		it( 'should return "false" to indicate no message handling', function () {

			const state = new State();
			expect( state.onMessage() ).to.be.false;

		} );

	} );

} );
