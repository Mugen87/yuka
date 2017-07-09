/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher';

class EntityManager {

	constructor () {

		this.entities = new Map();
		this.messageDispatcher = new MessageDispatcher( this );

	}

	add ( entity ) {

		this.entities.set( entity.id, entity );

		entity.addEventListener( 'message', this.onMessage, this );

		return this;

	}

	remove ( entity ) {

		this.entities.delete( entity.id );

		entity.removeEventListener( 'message', this.onMessage );

		return this;

	}

	getEntityById ( id ) {

		return this.entities.get( id );

	}

	update ( delta ) {

		for ( let entity of this.entities.values() ) {

			entity.update( delta );

		}

		this.messageDispatcher.dispatchDelayedMessages( delta );

	}

	onMessage ( event ) {

		const sender = event.target;
		const receiver = event.receiver;
		const message = event.message;
		const delay = event.delay;
		const data = event.data;

		this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

export { EntityManager };
