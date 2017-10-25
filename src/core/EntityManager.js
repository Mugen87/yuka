/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher.js';

class EntityManager {

	constructor() {

		this.entities = new Map();
		this.tagDirectory = new Map();
		this.messageDispatcher = new MessageDispatcher( this );

	}

	add( entity ) {

		// add entity to manager

		this.entities.set( entity.id, entity );

		// let the entity know its manager

		entity.manager = this;

		// update tag directory

		const tag = entity.tag;

		if ( this.tagDirectory.has( tag ) === true ) {

			const entities = this.tagDirectory.get( tag );
			entities.add( entity );

		} else {

			const entities = new Set();
			entities.add( entity );
			this.tagDirectory.set( tag, entities );

		}

		return this;

	}

	remove( entity ) {

		// remove entity from manager

		this.entities.delete( entity.id );

		// remove the reference to the manager

		entity.manager = null;

		// update tag directory

		const tag = entity.tag;
		const entities = this.tagDirectory.get( tag );

		if ( entities.size === 1 ) {

			this.tagDirectory.delete( tag );

		} else {

			entities.delete( entity );

		}

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

	getEntitiesByTag( tag ) {

		return this.tagDirectory.get( tag );

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
