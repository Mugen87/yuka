/**
* Other classes can inherit from this class in order to provide an
* event based API. Useful for controls development.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/

class EventDispatcher {

	/**
	* Constructs a new event dispatcher.
	*/
	constructor() {

		this._events = new Map();

	}

	/**
	* Adds an event listener for the given event type.
	*
	* @param {String} type - The event type.
	* @param {Function} listener - The event listener to add.
	*/
	addEventListener( type, listener ) {

		const events = this._events;

		if ( events.has( type ) === false ) {

			events.set( type, new Array() );

		}

		const listeners = events.get( type );

		if ( listeners.indexOf( listener ) === - 1 ) {

			listeners.push( listener );

		}

	}

	/**
	* Removes the given event listener for the given event type.
	*
	* @param {String} type - The event type.
	* @param {Function} listener - The event listener to remove.
	*/
	removeEventListener( type, listener ) {

		const events = this._events;
		const listeners = events.get( type );

		if ( listeners !== undefined ) {

			const index = listeners.indexOf( listener );

			if ( index !== - 1 ) listeners.splice( index, 1 );

		}

	}

	/**
	* Returns true if the given event listener is set for the given event type.
	*
	* @param {String} type - The event type.
	* @param {Function} listener - The event listener to test.
	* @return {Boolean} Whether the given event listener is set for the given event type or not.
	*/
	hasEventListener( type, listener ) {

		const events = this._events;
		const listeners = events.get( type );

		return ( listeners !== undefined ) && ( listeners.indexOf( listener ) !== - 1 );

	}

	/**
	* Dispatches an event to all respective event listeners.
	*
	* @param {Object} event - The event object.
	*/
	dispatchEvent( event ) {

		const events = this._events;
		const listeners = events.get( event.type );

		if ( listeners !== undefined ) {

			event.target = this;

			for ( let i = 0, l = listeners.length; i < l; i ++ ) {

				listeners[ i ].call( this, event );

			}

		}

	}

}

export { EventDispatcher };
