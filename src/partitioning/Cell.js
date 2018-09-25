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
		* @type AABB
		*/
		this.aabb = aabb;

		/**
		* The list of entries which belong to this cell.
		* @type Array
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
	* Removes all entries from the cell.
	*
	* @return {Cell} A reference to this cell.
	*/
	makeEmpty() {

		this.entries.length = 0;

		return this;

	}

	/**
	* Returns true if the cell is empty.
	*
	* @return {Boolean} The result of the test.
	*/
	empty() {

		return this.entries.length === 0;

	}

	/**
	* Returns true if the given AABB intersects the internal bounding volume of this cell.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersects( aabb ) {

		return this.aabb.intersectsAABB( aabb );

	}

}

export { Cell };
