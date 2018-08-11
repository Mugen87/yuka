/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Logger = YUKA.Logger;

describe( 'Logger', function () {

	describe( '#LEVEL', function () {

		it( 'should have all log levels as members', function () {

			expect( Logger.LEVEL ).to.have.a.property( 'LOG' );
			expect( Logger.LEVEL ).to.have.a.property( 'WARN' );
			expect( Logger.LEVEL ).to.have.a.property( 'ERROR' );
			expect( Logger.LEVEL ).to.have.a.property( 'SILENT' );

		} );

		it( 'should not allow to change the log level', function () {

			delete Logger.LEVEL.LOG;

			expect( Logger.LEVEL ).to.have.a.property( 'LOG' );

		} );

	} );

} );
