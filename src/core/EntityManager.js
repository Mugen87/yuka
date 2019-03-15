import { MessageDispatcher } from './MessageDispatcher.js';
import { GameEntity } from './GameEntity';
import { MovingEntity } from './MovingEntity';
import { Vehicle } from '../steering/Vehicle';
import { Trigger } from '../trigger/Trigger.js';
import { Logger } from './Logger.js';

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

		this._indexMap = new Map(); // used by spatial indices
		this._typesMap = new Map(); // used for deserialization of custom entities
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

		this._messageDispatcher.clear();

		return this;

	}

	/**
	* Returns an entity by the given name. If no game entity is found, *null*
	* is returned. This method should be used once (e.g. at {@link GameEntity#start})
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

		for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

			const entity = entities[ i ];

			this.updateEntity( entity, delta );

		}

		// update triggers

		for ( let i = ( triggers.length - 1 ); i >= 0; i -- ) {

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

			if ( entity._started === false ) {

				entity.start();

				entity._started = true;

			}

			//

			entity.update( delta );
			entity.updateWorldMatrix();

			//

			const children = entity.children;

			for ( let i = ( children.length - 1 ); i >= 0; i -- ) {

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

			for ( let i = ( entities.length - 1 ); i >= 0; i -- ) {

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

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			entities: new Array(),
			triggers: new Array(),
			_messageDispatcher: this._messageDispatcher.toJSON()
		};

		// entities

		function processEntity( entity ) {

			data.entities.push( entity.toJSON() );

			for ( let i = 0, l = entity.children.length; i < l; i ++ ) {

				processEntity( entity.children[ i ] );

			}

		}

		for ( let i = 0, l = this.entities.length; i < l; i ++ ) {

			// recursively process all entities

			processEntity( this.entities[ i ] );

		}

		// triggers

		for ( let i = 0, l = this.triggers.length; i < l; i ++ ) {

			const trigger = this.triggers[ i ];
			data.triggers.push( trigger.toJSON() );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {EntityManager} A reference to this entity manager.
	*/
	fromJSON( json ) {

		this.clear();

		const entitiesJSON = json.entities;
		const triggersJSON = json.triggers;
		const _messageDispatcherJSON = json._messageDispatcher;

		// entities

		const entitiesMap = new Map();

		for ( let i = 0, l = entitiesJSON.length; i < l; i ++ ) {

			const entityJSON = entitiesJSON[ i ];
			const type = entityJSON.type;

			let entity;

			switch ( type ) {

				case 'GameEntity':
					entity = new GameEntity().fromJSON( entityJSON );
					break;

				case 'MovingEntity':
					entity = new MovingEntity().fromJSON( entityJSON );
					break;

				case 'Vehicle':
					entity = new Vehicle().fromJSON( entityJSON );
					break;

				default:

					// handle custom type

					const ctor = this._typesMap.get( type );

					if ( ctor !== undefined ) {

						entity = new ctor().fromJSON( entityJSON );

					} else {

						Logger.warn( 'YUKA.EntityManager: Unsupported entity type:', type );
						continue;

					}

			}

			entitiesMap.set( entity.uuid, entity );

			if ( entity.parent === null ) this.add( entity );

		}

		// resolve UUIDs to game entity objects

		for ( let entity of entitiesMap.values() ) {

			entity.resolveReferences( entitiesMap );

		}

		// triggers

		for ( let i = 0, l = triggersJSON.length; i < l; i ++ ) {

			const triggerJSON = triggersJSON[ i ];
			const type = triggerJSON.type;

			let trigger;

			if ( type === 'Trigger' ) {

				trigger = new Trigger().fromJSON( triggerJSON );

			} else {

				// handle custom type

				const ctor = this._typesMap.get( type );

				if ( ctor !== undefined ) {

					trigger = new ctor().fromJSON( triggerJSON );

				} else {

					Logger.warn( 'YUKA.EntityManager: Unsupported trigger type:', type );
					continue;

				}

			}

			this.addTrigger( trigger );

		}

		// restore delayed messages

		this._messageDispatcher.fromJSON( _messageDispatcherJSON );

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link EntityManager#fromJSON}
	* the entity manager is able to pick the correct constructor in order to create custom
	* game entities or triggers.
	*
	* @param {String} type - The name of the entity or trigger type.
	* @param {Function} constructor - The constructor function.
	* @return {EntityManager} A reference to this entity manager.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

}

export { EntityManager };
