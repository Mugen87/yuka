/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Time = YUKA.Time;

describe( 'Time', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const time = new Time();

			expect( time ).to.have.a.property( 'startTime' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( 'previousTime' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( 'currentTime' ).that.is.equal( 0 );

		} );

	} );

	describe( '#getDelta()', function () {

		it( 'should return the delta time in seconds between the previous and current time', function () {

			const time = new Time();
			time.previousTime = 1000; // ms
			time.currentTime = 2000; // ms

			expect( time.getDelta() ).to.equal( 1 );

		} );

	} );

	describe( '#getElapsed()', function () {

		it( 'should return the elapsed time in seconds between the start and current time', function () {

			const time = new Time();
			time.startTime = 1000; // ms
			time.currentTime = 2000; // ms

			expect( time.getElapsed() ).to.equal( 1 );

		} );

	} );

	describe( '#now()', function () {

		it( 'should use "Date" as a fallback if the "Performance API" is not available', function () {

			const time = new Time();

			expect( time.now() ).to.not.throw;

		} );

	} );

	describe( '#update()', function () {

		it( 'should update the internal time values previous and current time', function () {

			const time = new Time();
			time.update();

			expect( time.previousTime ).to.equal( 0 );
			expect( time.currentTime ).to.be.above( 0 );

		} );

	} );

} );
