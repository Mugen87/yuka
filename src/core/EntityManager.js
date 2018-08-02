/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher.js';

class EntityManager {

	constructor() {

		this.entities = new Map();
		this.triggers = new Set();
		this._started = new Set();

		this.messageDispatcher = new MessageDispatcher();

	}

	add( entity ) {

		this.entities.set( entity.id, entity );

		entity.manager = this;

		return this;

	}

	remove( entity ) {

		this.entities.delete( entity.id );

		this._started.delete( entity );

		entity.manager = null;

		return this;

	}

	addTrigger( trigger ) {

		this.triggers.add( trigger );

		return this;

	}

	removeTrigger( trigger ) {

		this.triggers.delete( trigger );

		return this;

	}

	clear() {

		this.entities.clear();
		this.triggers.clear();
		this._started.clear();

		this.messageDispatcher.clear();

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

		// update entities

		for ( let entity of this.entities.values() ) {

			if ( entity.active === true ) {

				if ( this._started.has( entity ) === false ) {

					entity.start();

					this._started.add( entity );

				}

				entity.update( delta );

				entity.updateMatrix();

			}

		}

		// update triggers

		for ( let trigger of this.triggers.values() ) {

			trigger.update( delta );

			for ( let entity of this.entities.values() ) {

				if ( entity.active === true ) {

					trigger.check( entity );

				}

			}

		}

		// handle messaging

		this.messageDispatcher.dispatchDelayedMessages( delta );

	}

	sendMessage( sender, receiver, message, delay, data ) {

		this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

export { EntityManager };
