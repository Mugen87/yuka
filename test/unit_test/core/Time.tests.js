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

			expect( time ).to.have.a.property( '_previousTime' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( '_currentTime' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( '_delta' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( '_elapsed' ).that.is.equal( 0 );
			expect( time ).to.have.a.property( '_timescale' ).that.is.equal( 1 );
			expect( time ).to.have.a.property( '_useFixedDelta' ).that.be.false;
			expect( time ).to.have.a.property( '_fixedDelta' ).that.is.equal( 16.67 );

		} );

		it( 'should not perform a reset if the apps gets inactive', function () {

			global.document = new Document();

			const time = new Time();

			time._currentTime = - 1;

			global.document.hidden = true;
			global.document.dispatchEvent( { type: 'visibilitychange' } );
			expect( time._currentTime ).to.equal( - 1 );

		} );

		it( 'should perform a reset if the apps gets active again', function () {

			global.document = new Document();

			const time = new Time();

			time._currentTime = - 1;

			global.document.hidden = false;
			global.document.dispatchEvent( { type: 'visibilitychange' } );
			expect( time._currentTime ).to.not.equal( - 1 );

		} );

		it( 'should only use the page visibility API if available', function () {

			global.document = undefined;

			const time = new Time();

			expect( time._usePageVisibilityAPI ).to.be.false;

		} );

	} );

	describe( '#enableFixedDelta()/#disableFixedDelta()', function () {

		it( 'should enable/disable the usage of a fixed delta value.', function () {

			const time = new Time();

			time.enableFixedDelta();

			expect( time._useFixedDelta ).to.be.true;

			time.disableFixedDelta();

			expect( time._useFixedDelta ).to.be.false;

		} );

	} );

	describe( '#dispose()', function () {

		it( 'should free all internal resources', function () {

			global.document = new Document();

			const time = new Time();

			const listeners = global.document._events.get( 'visibilitychange' );

			expect( listeners ).to.have.lengthOf( 1 );

			time.dispose();

			expect( listeners ).to.have.lengthOf( 0 );

		} );

		it( 'should do nothing if no page visibility API is used', function () {

			global.document = undefined;

			const time = new Time();
			time.dispose();

		} );

	} );

	describe( '#getDelta()', function () {

		it( 'should return the delta time in seconds', function () {

			const time = new Time();
			time._delta = 1000; // ms

			expect( time.getDelta() ).to.equal( 1 );

		} );

	} );

	describe( '#getElapsed()', function () {

		it( 'should return the elapsed time in seconds', function () {

			const time = new Time();
			time._elapsed = 2000; // ms

			expect( time.getElapsed() ).to.equal( 2 );

		} );

	} );

	describe( '#setFixedDelta()/#getFixedDelta()', function () {

		it( 'should set and return fixed time delta value', function () {

			const time = new Time();
			time.setFixedDelta( 1 );

			expect( time.getFixedDelta() ).to.equal( 1 );

		} );

	} );

	describe( '#setTimescale()/#getTimescale()', function () {

		it( 'should set and return a timescale value', function () {

			const time = new Time();
			time.setTimescale( 2 );

			expect( time.getTimescale() ).to.equal( 2 );

		} );

	} );

	describe( '#reset()', function () {

		it( 'should reset this time object', function () {

			const time = new Time();
			time.reset();

			expect( time._currentTime ).to.be.above( 0 );

		} );

	} );

	describe( '#update()', function () {

		it( 'should update the delta and elapsed time', function () {

			const time = new Time();
			time.update();

			expect( time.getDelta() ).to.be.above( 0 );
			expect( time.getElapsed() ).to.be.above( 0 );

		} );

		it( 'should update the delta and elapsed time with a fixed time delta if configured', function () {

			const time = new Time();
			time.setFixedDelta( 1 );
			time.enableFixedDelta();
			time.update();

			expect( time.getDelta() ).to.equal( 1 );
			expect( time.getElapsed() ).to.equal( 1 );

		} );

		it( 'should respect the timescale when updating', function () {

			const time = new Time();
			time.setFixedDelta( 1 );
			time.enableFixedDelta();

			time.setTimescale( 2 );
			time.update();

			expect( time.getDelta() ).to.equal( 2 );
			expect( time.getElapsed() ).to.equal( 2 );

			time.setTimescale( 0.5 );
			time.update();

			expect( time.getDelta() ).to.equal( 0.5 );
			expect( time.getElapsed() ).to.equal( 2.5 );

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
