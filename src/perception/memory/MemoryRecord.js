import { Vector3 } from '../../math/Vector3.js';

/**
* Class for representing the memory information about a single game entity.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MemoryRecord {

	/**
	* Constructs a new memory record.
	*
	* @param {GameEntity} entity - The game entity that is represented by this memory record.
	*/
	constructor( entity = null ) {

		/**
		* The game entity that is represented by this memory record.
		* @type {?GameEntity}
		* @default null
		*/
		this.entity = entity;

		/**
		* Records the time the entity became visible. Useful in combination with a reaction time
		* in order to prevent immediate actions.
		* @type {Number}
		* @default - Infinity
		*/
		this.timeBecameVisible = - Infinity;

		/**
		* Records the time the entity was last sensed (e.g. seen or heard). Used to determine
		* if a game entity can "remember" this record or not.
		* @type {Number}
		* @default - Infinity
		*/
		this.timeLastSensed = - Infinity;

		/**
		* Marks the position where the opponent was last sensed.
		* @type {Vector3}
		*/
		this.lastSensedPosition = new Vector3();

		/**
		* Whether this game entity is visible or not.
		* @type {Boolean}
		* @default false
		*/
		this.visible = false;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			entity: this.entity.uuid,
			timeBecameVisible: this.timeBecameVisible.toString(),
			timeLastSensed: this.timeLastSensed.toString(),
			lastSensedPosition: this.lastSensedPosition.toArray( new Array() ),
			visible: this.visible
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MemoryRecord} A reference to this memory record.
	*/
	fromJSON( json ) {

		this.entity = json.entity; // uuid
		this.timeBecameVisible = parseFloat( json.timeBecameVisible );
		this.timeLastSensed = parseFloat( json.timeLastSensed );
		this.lastSensedPosition.fromArray( json.lastSensedPosition );
		this.visible = json.visible;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {MemoryRecord} A reference to this memory record.
	*/
	resolveReferences( entities ) {

		this.entity = entities.get( this.entity ) || null;

		return this;

	}

}

export { MemoryRecord };
