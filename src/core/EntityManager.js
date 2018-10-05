import { MessageDispatcher } from './MessageDispatcher.js';

const candidates = [];

/**
* This class is used for managing all central objects of a game like
* game entities and triggers.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class EntityManager {

	/**
	* Constructs a new entity manager.
	*/
	constructor() {

		/**
		* A list of {@link GameEntity game entities }.
		* @type Array
		*/
		this.entities = new Array();

		/**
		* A list of {@link Trigger triggers }.
		* @type Array
		*/
		this.triggers = new Array();

		/**
		* A reference to a spatial index.
		* @type CellSpacePartitioning
		* @default null
		*/
		this.spatialIndex = null;

		this._entityMap = new Map(); // for fast ID access
		this._indexMap = new Map(); // used by spatial indices
		this._started = new Set(); // used to control the call of GameEntity.start()
		this._messageDispatcher = new MessageDispatcher();

	}

	/**
	* Adds a game entity to this entity manager.
	*
	* @param {GameEntity} entity - The game entity to add.
	* @return {EntityManager} A reference to this entity manager.
	*/
	add( entity ) {

		this.entities.push( entity );
		this._entityMap.set( entity.id, entity );

		entity.manager = this;

		return this;

	}

	/**
	* Removes a game entity from this entity manager.
	*
	* @param {GameEntity} entity - The game entity to remove.
	* @return {EntityManager} A reference to this entity manager.
	*/
	remove( entity ) {

		const index = this.entities.indexOf( entity );
		this.entities.splice( index, 1 );

		this._entityMap.delete( entity.id );
		this._started.delete( entity );

		entity.manager = null;

		return this;

	}

	/**
	* Adds a trigger to this entity manager.
	*
	* @param {Trigger} trigger - The trigger to add.
	* @return {EntityManager} A reference to this entity manager.
	*/
	addTrigger( trigger ) {

		this.triggers.push( trigger );

		return this;

	}

	/**
	* Removes a trigger to this entity manager.
	*
	* @param {Trigger} trigger - The trigger to remove.
	* @return {EntityManager} A reference to this entity manager.
	*/
	removeTrigger( trigger ) {

		const index = this.triggers.indexOf( trigger );
		this.triggers.splice( index, 1 );

		return this;

	}

	/**
	* Clears the internal state of this entity manager.
	*
	* @return {EntityManager} A reference to this entity manager.
	*/
	clear() {

		this.entities.length = 0;
		this.triggers.length = 0;

		this._entityMap.clear();
		this._started.clear();

		this._messageDispatcher.clear();

		return this;

	}

	/**
	* Returns an entity by the given ID. If no game entity is found, *null*
	* is returned.
	*
	* @param {Number} id - The id of the game entity.
	* @return {GameEntity} The found game entity.
	*/
	getEntityById( id ) {

		return this._entityMap.get( id ) || null;

	}

	/**
	* Returns an entity by the given name. If no game entity is found, *null*
	* is returned. This method is more expensive than {@link GameEntity#getEntityById}
	* and should not be used in each simlation step. Instead, it should be used once
	* and the result should be cached for later use.
	*
	* @param {String} name - The name of the game entity.
	* @return {GameEntity} The found game entity.
	*/
	getEntityByName( name ) {

		const entities = this.entities;

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			if ( entity.name === name ) return entity;

		}

		return null;

	}

	/**
	* The central update method of this entity manager. Updates all
	* game entities, triggers and delayed messages.
	*
	* @param {Number} delta - The time delta.
	* @return {EntityManager} A reference to this entity manager.
	*/
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

		return this;

	}

	/**
	* Updates a single entity.
	*
	* @param {GameEntity} entity - The game entity to update.
	* @param {Number} delta - The time delta.
	* @return {EntityManager} A reference to this entity manager.
	*/
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

				this.updateEntity( child, delta );

			}

			//

			if ( this.spatialIndex !== null ) {

				let currentIndex = this._indexMap.get( entity ) || - 1;
				currentIndex = this.spatialIndex.updateEntity( entity, currentIndex );
				this._indexMap.set( entity, currentIndex );

			}

			//

			const renderComponent = entity._renderComponent;
			const renderComponentCallback = entity._renderComponentCallback;

			if ( renderComponent !== null && renderComponentCallback !== null ) {

				renderComponentCallback( entity, renderComponent );

			}

		}

		return this;

	}

	/**
	* Updates the neighborhood of a single game entity.
	*
	* @param {GameEntity} entity - The game entity to update.
	* @return {EntityManager} A reference to this entity manager.
	*/
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

		return this;

	}

	/**
	* Updates a single trigger.
	*
	* @param {Trigger} trigger - The trigger to update.
	* @return {EntityManager} A reference to this entity manager.
	*/
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

		return this;

	}

	/**
	* Interface for game entities so they can send messages to other game entities.
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {EntityManager} A reference to this entity manager.
	*/
	sendMessage( sender, receiver, message, delay, data ) {

		this._messageDispatcher.dispatch( sender, receiver, message, delay, data );

		return this;

	}

}

export { EntityManager };
