import { AABB } from '../math/AABB.js';

/**
* Class for representing a single partition in context of cell-space partitioning.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Cell {

	/**
	* Constructs a new cell with the given values.
	*
	* @param {AABB} aabb - The bounding volume of the cell.
	*/
	constructor( aabb = new AABB() ) {

		/**
		* The bounding volume of the cell.
		* @type {AABB}
		*/
		this.aabb = aabb;

		/**
		* The list of entries which belong to this cell.
		* @type {Array<Any>}
		* @readonly
		*/
		this.entries = new Array();

	}

	/**
	* Adds an entry to this cell.
	*
	* @param {Any} entry - The entry to add.
	* @return {Cell} A reference to this cell.
	*/
	add( entry ) {

		this.entries.push( entry );

		return this;

	}

	/**
	* Removes an entry from this cell.
	*
	* @param {Any} entry - The entry to remove.
	* @return {Cell} A reference to this cell.
	*/
	remove( entry ) {

		const index = this.entries.indexOf( entry );
		this.entries.splice( index, 1 );

		return this;

	}

	/**
	* Removes all entries from this cell.
	*
	* @return {Cell} A reference to this cell.
	*/
	makeEmpty() {

		this.entries.length = 0;

		return this;

	}

	/**
	* Returns true if this cell is empty.
	*
	* @return {Boolean} Whether this cell is empty or not.
	*/
	empty() {

		return this.entries.length === 0;

	}

	/**
	* Returns true if the given AABB intersects the internal bounding volume of this cell.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} Whether this cell intersects with the given AABB or not.
	*/
	intersects( aabb ) {

		return this.aabb.intersectsAABB( aabb );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name,
			aabb: this.aabb.toJSON(),
			entries: new Array()
		};

		const entries = this.entries;

		for ( let i = 0, l = entries.length; i < l; i ++ ) {

			json.entries.push( entries[ i ].uuid );

		}

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Cell} A reference to this game entity.
	*/
	fromJSON( json ) {

		this.aabb.fromJSON( json.aabb );
		this.entries = json.entries.slice();

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {Cell} A reference to this cell.
	*/
	resolveReferences( entities ) {

		const entries = this.entries;

		for ( let i = 0, l = entries.length; i < l; i ++ ) {

			entries[ i ] = entities.get( entries[ i ] );

		}

		return this;

	}

}

export { Cell };
