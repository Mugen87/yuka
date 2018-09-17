/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher.js';

class EntityManager {

	constructor() {

		this.entities = new Map();
		this.triggers = new Set();

		this._started = new Set();
		this._messageDispatcher = new MessageDispatcher();

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

		this._messageDispatcher.clear();

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

		this._messageDispatcher.dispatchDelayedMessages( delta );

	}

	updateEntity( entity, delta ) {

		if ( entity.active === true ) {

			this.updateNeighborhood( entity );

			//

			if ( this._started.has( entity ) === false ) {

				entity.start();

				this._started.add( entity );

			}

			//

			entity.update( delta );
			entity.updateWorldMatrix();

			//

			for ( const child of entity.children ) {

				this.updateEntity( child );

			}

		}

	}

	updateNeighborhood( entity ) {

		if ( entity.updateNeighborhood === true ) {

			entity.neighbors.clear();

			const neighborhoodRadiusSq = ( entity.neighborhoodRadius * entity.neighborhoodRadius );

			// this approach is computationally expensive since we iterate over all entities -> O(n²)
			// use an optional spatial index to improve runtime complexity

			for ( let candidate of this.entities.values() ) {

				if ( entity !== candidate ) {

					const distanceSq = entity.position.squaredDistanceTo( candidate.position );

					if ( distanceSq <= neighborhoodRadiusSq ) {

						entity.neighbors.add( candidate );

					}

				}

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

		this._messageDispatcher.dispatch( sender, receiver, message, delay, data );

	}

}

export { EntityManager };
