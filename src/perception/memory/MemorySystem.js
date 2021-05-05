import { MemoryRecord } from './MemoryRecord.js';

/**
* Class for representing the memory system of a game entity. It is used for managing,
* filtering, and remembering sensory input.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MemorySystem {

	/**
	* Constructs a new memory system.
	*
	* @param {GameEntity} owner - The game entity that owns this memory system.
	*/
	constructor( owner = null ) {

		/**
		* The game entity that owns this memory system.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* Used to simulate memory of sensory events. It contains {@link MemoryRecord memory records}
		* of all relevant game entities in the environment. The records are usually update by
		* the owner of the memory system.
		* @type {Array<MemoryRecord>}
		*/
		this.records = new Array();

		/**
		* Same as {@link MemorySystem#records} but used for fast access via the game entity.
		* @type {Map<GameEntity,MemoryRecord>}
		*/
		this.recordsMap = new Map();

		/**
		* Represents the duration of the game entities short term memory in seconds.
		* When a bot requests a list of all recently sensed game entities, this value
		* is used to determine if the bot is able to remember a game entity or not.
		* @type {Number}
		* @default 1
		*/
		this.memorySpan = 1;

	}

	/**
	* Returns the memory record of the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {MemoryRecord} The memory record for this game entity.
	*/
	getRecord( entity ) {

		return this.recordsMap.get( entity );

	}

	/**
	* Creates a memory record for the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {MemorySystem} A reference to this memory system.
	*/
	createRecord( entity ) {

		const record = new MemoryRecord( entity );

		this.records.push( record );
		this.recordsMap.set( entity, record );

		return this;

	}

	/**
	* Deletes the memory record for the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {MemorySystem} A reference to this memory system.
	*/
	deleteRecord( entity ) {

		const record = this.getRecord( entity );
		const index = this.records.indexOf( record );

		this.records.splice( index, 1 );
		this.recordsMap.delete( entity );

		return this;

	}

	/**
	* Returns true if there is a memory record for the given game entity.
	*
	* @param {GameEntity} entity - The game entity.
	* @return {Boolean} Whether the game entity has a memory record or not.
	*/
	hasRecord( entity ) {

		return this.recordsMap.has( entity );

	}

	/**
	* Removes all memory records from the memory system.
	*
	* @return {MemorySystem} A reference to this memory system.
	*/
	clear() {

		this.records.length = 0;
		this.recordsMap.clear();

		return this;

	}

	/**
	* Determines all valid memory record and stores the result in the given array.
	*
	* @param {Number} currentTime - The current elapsed time.
	* @param {Array<MemoryRecord>} result - The result array.
	* @return {Array<MemoryRecord>} The result array.
	*/
	getValidMemoryRecords( currentTime, result ) {

		const records = this.records;

		result.length = 0;

		for ( let i = 0, l = records.length; i < l; i ++ ) {

			const record = records[ i ];

			if ( ( currentTime - record.timeLastSensed ) <= this.memorySpan ) {

				result.push( record );

			}

		}

		return result;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			owner: this.owner.uuid,
			records: new Array(),
			memorySpan: this.memorySpan
		};

		const records = this.records;

		for ( let i = 0, l = records.length; i < l; i ++ ) {

			const record = records[ i ];
			json.records.push( record.toJSON() );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MemorySystem} A reference to this memory system.
	*/
	fromJSON( json ) {

		this.owner = json.owner; // uuid
		this.memorySpan = json.memorySpan;

		const recordsJSON = json.records;

		for ( let i = 0, l = recordsJSON.length; i < l; i ++ ) {

			const recordJSON = recordsJSON[ i ];
			const record = new MemoryRecord().fromJSON( recordJSON );

			this.records.push( record );

		}

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {MemorySystem} A reference to this memory system.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		// records

		const records = this.records;

		for ( let i = 0, l = records.length; i < l; i ++ ) {

			const record = 	records[ i ];

			record.resolveReferences( entities );
			this.recordsMap.set( record.entity, record );

		}

		return this;

	}

}

export { MemorySystem };
