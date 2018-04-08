/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher.js';

class EntityManager {

	constructor() {

		this.entities = new Map();
		this.messageDispatcher = new MessageDispatcher( this );

	}

	add( entity ) {

		// add entity to manager

		this.entities.set( entity.id, entity );

		// let the entity know its manager

		entity.manager = this;

		return this;

	}

	remove( entity ) {

		// remove entity from manager

		this.entities.delete( entity.id );

		// remove the reference to the manager

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
