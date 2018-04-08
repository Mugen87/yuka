/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class EventDispatcher {

	constructor() {

		this.listeners = {};

	}

	addEventListener( type, listener, scope ) {

		const listeners = this.listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listener.scope = scope;

			listeners[ type ].push( listener );

		}

	}

	hasEventListener( type, listener ) {

		const listeners = this.listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	removeEventListener( type, listener ) {

		const listeners = this.listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatchEvent( event ) {

		const listeners = this.listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				const listener = array[ i ];

				listener.call( listener.scope || this, event );

			}

		}

	}

}


export { EventDispatcher };
