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

		return this.entities.get( id ) || null;

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

			this.updateEntity( entity, delta );

		}

		// update triggers

		for ( let trigger of this.triggers.values() ) {

			this.updateTrigger( trigger, delta );

		}

		// handle messaging

		this.messageDispatcher.dispatchDelayedMessages( delta );

	}

	updateEntity( entity, delta ) {

		if ( entity.active === true ) {

			if ( this._started.has( entity ) === false ) {

				entity.start();

				this._started.add( entity );

			}

			entity.update( delta );

			entity.updateWorldMatrix();

			for ( const child of entity.children ) {

				this.updateEntity( child );

			}

		}

	}

	updateTrigger( trigger, delta ) {

		if ( trigger.active === true ) {

			trigger.update( delta );

			for ( let entity of this.entities.values() ) {

				if ( entity.active === true ) {

					trigger.check( entity );

				}

			}

		}

	}

	sendMessage( sender, receiver, message, delay, data ) {

		this.messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

export { EntityManager };
