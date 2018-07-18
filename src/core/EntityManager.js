/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher.js';

class EntityManager {

	constructor() {

		this.entities = new Map();
		this.messageDispatcher = new MessageDispatcher( this );

		this._active = new Set();

	}

	add( entity ) {

		this.entities.set( entity.id, entity );

		entity.addEventListener( 'message', this.onMessage, this );

		entity.manager = this;

		return this;

	}

	remove( entity ) {

		this.entities.delete( entity.id );

		entity.removeEventListener( 'message', this.onMessage );

		entity.manager = null;

		this._active.delete( entity );

		return this;

	}

	getEntityById( id ) {

		return this.entities.get( id );

	}

	getEntityByName( name ) {

		for ( let entity of this.entities.values() ) {

			if ( entity.name === name ) return entity;

		}

		return null;

	}

	update( delta ) {

		for ( let entity of this.entities.values() ) {

			if ( this._active.has( entity ) === false ) {

				entity.start();

				this._active.add( entity );

			}

			entity.update( delta );

			entity.updateMatrix();

		}

		this.messageDispatcher.dispatchDelayedMessages( delta );

	}

	onMessage( event ) {

		const sender = event.target;
		const receiver = event.receiver;
		const message = event.message;
		const delay = event.delay;
		const data = event.data;

		if ( receiver !== null ) {

			this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

		} else {

			console.warn( 'YUKA.EntityManager: Unable to send message to receiver. Could not find game entity for name:', name );

		}

	}

}

export { EntityManager };
