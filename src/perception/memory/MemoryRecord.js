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
		* @type GameEntity
		*/
		this.entity = entity;

		/**
		* Records the time the entity was last sensed (e.g. seen or heard). Used to determine
		* if a game entity can "remember" this record or not.
		* @type Number
		* @default - 1
		*/
		this.timeLastSensed = - 1;

		/**
		*	Marks the position where the opponent was last sensed.
		* @type Vector3
		*/
		this.lastSensedPosition = new Vector3();

		/**
		* Whether this game entity is visible or not.
		* @type Boolean
		* @default false
		*/
		this.visible = false;

	}

}

export { MemoryRecord };
