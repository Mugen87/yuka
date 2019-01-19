/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const EventDispatcher = YUKA.EventDispatcher;

describe( 'EventDispatcher', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const eventDispatcher = new EventDispatcher();

			expect( eventDispatcher ).to.have.a.property( '_events' ).that.is.a( 'map' );

		} );

	} );

	describe( '#addEventListener()', function () {

		it( 'should add event listeners for a specific event type to this event dispatcher', function () {

			const eventDispatcher = new EventDispatcher();

			const listener1 = () => {};
			const listener2 = () => {};

			eventDispatcher.addEventListener( 'jump', listener1 );
			eventDispatcher.addEventListener( 'jump', listener2 );

			expect( eventDispatcher._events.get( 'jump' ) ).to.include( listener1, listener2 );

		} );

		it( 'should not add a listener twice for a specific event type', function () {

			const eventDispatcher = new EventDispatcher();

			const listener1 = () => {};

			eventDispatcher.addEventListener( 'jump', listener1 );
			eventDispatcher.addEventListener( 'jump', listener1 );

			expect( eventDispatcher._events.get( 'jump' ) ).to.have.lengthOf( 1 );

		} );

	} );

	describe( '#removeEventListener()', function () {

		it( 'should remove event listeners for a specific event type to this event dispatcher', function () {

			const eventDispatcher = new EventDispatcher();

			const listener1 = () => {};
			const listener2 = () => {};
			const listener3 = () => {};

			eventDispatcher.addEventListener( 'jump', listener1 );
			eventDispatcher.addEventListener( 'jump', listener2 );

			eventDispatcher.removeEventListener( 'jump', listener1 );
			eventDispatcher.removeEventListener( 'jump', listener2 );
			eventDispatcher.removeEventListener( 'jump', listener3 );

			expect( eventDispatcher._events.get( 'jump' ) ).to.not.include( listener1, listener2, listener3 );

		} );

		it( 'should not throw an error if a non existing listener is removed', function () {

			const eventDispatcher = new EventDispatcher();

			const listener1 = () => {};

			eventDispatcher.removeEventListener( 'jump', listener1 );

			expect( eventDispatcher._events.get( 'jump' ) ).to.be.undefined;

		} );

	} );

	describe( '#hasEventListener()', function () {

		it( 'should return true if the given event listener for the given event type is set', function () {

			const eventDispatcher = new EventDispatcher();

			const listener1 = () => {};
			const listener2 = () => {};

			eventDispatcher.addEventListener( 'jump', listener1 );

			expect( eventDispatcher.hasEventListener( 'jump', listener1 ) ).to.be.true;
			expect( eventDispatcher.hasEventListener( 'jump', listener2 ) ).to.be.false;
			expect( eventDispatcher.hasEventListener( 'shot', listener1 ) ).to.be.false;

		} );

	} );

	describe( '#dispatchEvent()', function () {

		it( 'should execute all event listeners for the respective event type', function () {

			const eventDispatcher = new EventDispatcher();
			const event = { type: 'jump' };

			const listener = ( e ) => {

				expect( event ).to.equal( e );

			};

			eventDispatcher.addEventListener( 'jump', listener );
			eventDispatcher.dispatchEvent( event );
			eventDispatcher.dispatchEvent( { type: 'shot' } );

		} );

	} );

} );
