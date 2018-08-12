/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Regulator = YUKA.Regulator;
const Time = YUKA.Time;

describe( 'Regulator', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const regulator = new Regulator();

			expect( regulator ).to.have.a.property( 'updateFrequency' ).that.is.equal( 0 );
			expect( regulator ).to.have.a.property( '_time' ).that.is.an.instanceof( Time );
			expect( regulator ).to.have.a.property( '_nextUpdateTime' ).that.is.equal( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const regulator = new Regulator( 2 );
			expect( regulator.updateFrequency ).to.equal( 2 );

		} );

	} );

	describe( '#ready()', function () {

		it( 'should return true to allow code flow if enough time has passed', function ( done ) {

			const regulator = new Regulator( 2 ); // 2 updates per second, 500 ms between updates

			expect( regulator.ready() ).to.be.true;

			setTimeout( function () {

				expect( regulator.ready() ).to.be.true;
				done();

			}, 600 );

		} );

		it( 'should return false to prevent code flow if not enough time has passed', function ( done ) {

			const regulator = new Regulator( 2 ); // 2 updates per second, 500 ms between updates

			expect( regulator.ready() ).to.be.true;

			setTimeout( function () {

				expect( regulator.ready() ).to.be.false;
				done();

			}, 300 );

		} );

	} );

} );
