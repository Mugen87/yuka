/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { MessageDispatcher } from './MessageDispatcher.js';

const candidates = [];

class EntityManager {

	constructor() {

		this.entities = new Array();
		this.triggers = new Array();
		this.spatialIndex = null;

		this._entityMap = new Map(); // for fast ID access
		this._indexMap = new Map(); // used by spatial indices
		this._started = new Set(); // used to control the call of GameEntity.start()
		this._messageDispatcher = new MessageDispatcher();

	}

	add( entity ) {

		this.entities.push( entity );
		this._entityMap.set( entity.id, entity );

		entity.manager = this;

		return this;

	}

	remove( entity ) {

		const index = this.entities.indexOf( entity );
		this.entities.splice( index, 1 );

		this._entityMap.delete( entity.id );
		this._started.delete( entity );

		entity.manager = null;

		return this;

	}

	addTrigger( trigger ) {

		this.triggers.push( trigger );

		return this;

	}

	removeTrigger( trigger ) {

		const index = this.triggers.indexOf( trigger );
		this.triggers.splice( index, 1 );

		return this;

	}

	clear() {

		this.entities.length = 0;
		this.triggers.length = 0;

		this._entityMap.clear();
		this._started.clear();

		this._messageDispatcher.clear();

	}

	getEntityById( id ) {

		return this._entityMap.get( id ) || null;

	}

	getEntityByName( name ) {

		const entities = this.entities;

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			if ( entity.name === name ) return entity;

		}

		return null;

	}

	update( delta ) {

		const entities = this.entities;
		const triggers = this.triggers;

		// update entities

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			this.updateEntity( entity, delta );

		}

		// update triggers

		for ( let i = 0, l = triggers.length; i < l; i ++ ) {

			const trigger = triggers[ i ];

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

			const children = entity.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];

				this.updateEntity( child );

			}

			//

			if ( this.spatialIndex !== null ) {

				let currentIndex = this._indexMap.get( entity ) || - 1;
				currentIndex = this.spatialIndex.updateEntity( entity, currentIndex );
				this._indexMap.set( entity, currentIndex );

			}

		}

	}

	updateNeighborhood( entity ) {

		if ( entity.updateNeighborhood === true ) {

			entity.neighbors.length = 0;

			// determine candidates

			if ( this.spatialIndex !== null ) {

				this.spatialIndex.query( entity.position, entity.neighborhoodRadius, candidates );

			} else {

				// worst case runtime complexity with O(n²)

				candidates.length = 0;
				candidates.push( ...this.entities );

			}

			// verify if candidates are within the predefined range

			const neighborhoodRadiusSq = ( entity.neighborhoodRadius * entity.neighborhoodRadius );

			for ( let i = 0, l = candidates.length; i < l; i ++ ) {

				const candidate = candidates[ i ];

				if ( entity !== candidate && candidate.active === true ) {

					const distanceSq = entity.position.squaredDistanceTo( candidate.position );

					if ( distanceSq <= neighborhoodRadiusSq ) {

						entity.neighbors.push( candidate );

					}

				}

			}

		}

	}

	updateTrigger( trigger, delta ) {

		if ( trigger.active === true ) {

			trigger.update( delta );

			const entities = this.entities;

			for ( let i = 0, l = entities.length; i < l; i ++ ) {

				const entity = entities[ i ];

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
