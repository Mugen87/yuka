/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Time = YUKA.Time;
const EventDispatcher = YUKA.EventDispatcher;

describe( 'Time', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const time = new Time();

			expect( time ).to.have.a.property( 'previousTime' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( 'currentTime' ).that.is.a( 'number' );
			expect( time ).to.have.a.property( 'detectPageVisibility' ).that.is.true;

		} );

		it( 'should use a resetted time value if the app was inactive', function () {

			const time = new Time();

			time.currentTime = - 1;
			global.document.dispatchEvent( { type: 'visibilitychange' } );

			expect( time.currentTime ).to.not.equal( - 1 );

		} );

	} );

	describe( '#getDelta()', function () {

		it( 'should return the delta time in seconds', function () {

			const time = new Time();
			time._deltaTime = 1000; // ms

			expect( time.getDelta() ).to.equal( 1 );

		} );

	} );

	describe( '#getElapsed()', function () {

		it( 'should return the elapsed time in seconds', function () {

			const time = new Time();
			time._elapsedTime = 2000; // ms

			expect( time.getElapsed() ).to.equal( 2 );

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
			time.currentTime = 1;
			time.update();

			expect( time.previousTime ).to.equal( 1 );
			expect( time.currentTime ).to.be.above( 1 );

		} );

	} );

} );

//

class Document extends EventDispatcher {

	constructor() {

		super();

		this.hidden = false;

	}

}

global.document = new Document();
