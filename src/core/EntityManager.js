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

		entity.manager = this;

		return this;

	}

	remove( entity ) {

		this.entities.delete( entity.id );
		this._active.delete( entity );

		entity.manager = null;

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

	sendMessage( sender, receiver, message, delay, data ) {

		this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

export { EntityManager };
