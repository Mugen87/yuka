import { Cell } from './Cell.js';
import { AABB } from '../math/AABB.js';
import { Vector3 } from '../math/Vector3.js';

const clampedPosition = new Vector3();
const aabb = new AABB();
const contour = new Array();

/**
* This class is used for cell-space partitioning, a basic approach for implementing
* a spatial index. The 3D space is divided up into a number of cells. A cell contains a
* list of references to all the entities it contains. Compared to other spatial indices like
* octrees, the division of the 3D space is coarse and often not balanced but the computational
* overhead for calculating the index of a specific cell based on a position vector is very fast.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class CellSpacePartitioning {

	/**
	* Constructs a new spatial index with the given values.
	*
	* @param {Number} width - The width of the entire spatial index.
	* @param {Number} height - The height of the entire spatial index.
	* @param {Number} depth - The depth of the entire spatial index.
	* @param {Number} cellsX - The amount of cells along the x-axis.
	* @param {Number} cellsY - The amount of cells along the y-axis.
	* @param {Number} cellsZ - The amount of cells along the z-axis.
	*/
	constructor( width, height, depth, cellsX, cellsY, cellsZ ) {

		/**
		* The list of partitions.
		* @type {Array<Cell>}
		*/
		this.cells = new Array();

		/**
		* The width of the entire spatial index.
		* @type {Number}
		*/
		this.width = width;

		/**
		* The height of the entire spatial index.
		* @type {Number}
		*/
		this.height = height;

		/**
		* The depth of the entire spatial index.
		* @type {Number}
		*/
		this.depth = depth;

		/**
		* The amount of cells along the x-axis.
		* @type {Number}
		*/
		this.cellsX = cellsX;

		/**
		* The amount of cells along the y-axis.
		* @type {Number}
		*/
		this.cellsY = cellsY;

		/**
		* The amount of cells along the z-axis.
		* @type {Number}
		*/
		this.cellsZ = cellsZ;

		this._halfWidth = this.width / 2;
		this._halfHeight = this.height / 2;
		this._halfDepth = this.depth / 2;

		this._min = new Vector3( - this._halfWidth, - this._halfHeight, - this._halfDepth );
		this._max = new Vector3( this._halfWidth, this._halfHeight, this._halfDepth );

		//

		const cellSizeX = this.width / this.cellsX;
		const cellSizeY = this.height / this.cellsY;
		const cellSizeZ = this.depth / this.cellsZ;

		for ( let i = 0; i < this.cellsX; i ++ ) {

			const x = ( i * cellSizeX ) - this._halfWidth;

			for ( let j = 0; j < this.cellsY; j ++ ) {

				const y = ( j * cellSizeY ) - this._halfHeight;

				for ( let k = 0; k < this.cellsZ; k ++ ) {

					const z = ( k * cellSizeZ ) - this._halfDepth;

					const min = new Vector3();
					const max = new Vector3();

					min.set( x, y, z );

					max.x = min.x + cellSizeX;
					max.y = min.y + cellSizeY;
					max.z = min.z + cellSizeZ;

					const aabb = new AABB( min, max );
					const cell = new Cell( aabb );

					this.cells.push( cell );

				}

			}

		}

	}

	/**
	* Updates the partitioning index of a given game entity.
	*
	* @param {GameEntity} entity - The entity to update.
	* @param {Number} currentIndex - The current partition index of the entity.
	* @return {Number} The new partitioning index for the given game entity.
	*/
	updateEntity( entity, currentIndex = - 1 ) {

		const newIndex = this.getIndexForPosition( entity.position );

		if ( currentIndex !== newIndex ) {

			this.addEntityToPartition( entity, newIndex );

			if ( currentIndex !== - 1 ) {

				this.removeEntityFromPartition( entity, currentIndex );

			}

		}

		return newIndex;

	}

	/**
	* Adds an entity to a specific partition.
	*
	* @param {GameEntity} entity - The entity to add.
	* @param {Number} index - The partition index.
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	addEntityToPartition( entity, index ) {

		const cell = this.cells[ index ];
		cell.add( entity );

		return this;

	}

	/**
	* Removes an entity from a specific partition.
	*
	* @param {GameEntity} entity - The entity to remove.
	* @param {Number} index - The partition index.
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	removeEntityFromPartition( entity, index ) {

		const cell = this.cells[ index ];
		cell.remove( entity );

		return this;

	}

	/**
	* Computes the partition index for the given position vector.
	*
	* @param {Vector3} position - The given position.
	* @return {Number} The partition index.
	*/
	getIndexForPosition( position ) {

		clampedPosition.copy( position ).clamp( this._min, this._max );

		let indexX = Math.abs( Math.floor( ( this.cellsX * ( clampedPosition.x + this._halfWidth ) ) / this.width ) );
		let indexY = Math.abs( Math.floor( ( this.cellsY * ( clampedPosition.y + this._halfHeight ) ) / this.height ) );
		let indexZ = Math.abs( Math.floor( ( this.cellsZ * ( clampedPosition.z + this._halfDepth ) ) / this.depth ) );

		// handle index overflow

		if ( indexX === this.cellsX ) indexX = this.cellsX - 1;
		if ( indexY === this.cellsY ) indexY = this.cellsY - 1;
		if ( indexZ === this.cellsZ ) indexZ = this.cellsZ - 1;

		// calculate final index

		return ( indexX * this.cellsY * this.cellsZ ) + ( indexY * this.cellsZ ) + indexZ;

	}

	/**
	* Performs a query to the spatial index according the the given position and
	* radius. The method approximates the query position and radius with an AABB and
	* then performs an intersection test with all non-empty cells in order to determine
	* relevant partitions. Stores the result in the given result array.
	*
	* @param {Vector3} position - The given query position.
	* @param {Number} radius - The given query radius.
	* @param {Array<Any>} result - The result array.
	* @return {Array<Any>} The result array.
	*/
	query( position, radius, result ) {

		const cells = this.cells;

		result.length = 0;

		// approximate range with an AABB which allows fast intersection test

		aabb.min.copy( position ).subScalar( radius );
		aabb.max.copy( position ).addScalar( radius );

		// test all non-empty cells for an intersection

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			const cell = cells[ i ];

			if ( cell.empty() === false && cell.intersects( aabb ) === true ) {

				result.push( ...cell.entries );

			}

		}

		return result;

	}

	/**
	* Removes all entities from all partitions.
	*
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	makeEmpty() {

		const cells = this.cells;

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			cells[ i ].makeEmpty();

		}

		return this;

	}

	/**
	* Adds a polygon to the spatial index. A polygon is approximated with an AABB.
	*
	* @param {Polygon} polygon - The polygon to add.
	* @return {CellSpacePartitioning} A reference to this spatial index.
	*/
	addPolygon( polygon ) {

		const cells = this.cells;

		polygon.getContour( contour );

		aabb.fromPoints( contour );

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			const cell = cells[ i ];

			if ( cell.intersects( aabb ) === true ) {

				cell.add( polygon );

			}

		}

		return this;

	}

	/**
	 * Transforms this instance into a JSON object.
	 *
	 * @return {Object} The JSON object.
	 */
	toJSON() {

		const json = {
			type: this.constructor.name,
			cells: new Array(),
			width: this.width,
			height: this.height,
			depth: this.depth,
			cellsX: this.cellsX,
			cellsY: this.cellsY,
			cellsZ: this.cellsZ,
			_halfWidth: this._halfWidth,
			_halfHeight: this._halfHeight,
			_halfDepth: this._halfDepth,
			_min: this._min.toArray( new Array() ),
			_max: this._max.toArray( new Array() )
		};

		for ( let i = 0, l = this.cells.length; i < l; i ++ ) {

			json.cells.push( this.cells[ i ].toJSON() );

		}

		return json;

	}

	/**
	 * Restores this instance from the given JSON object.
	 *
	 * @param {Object} json - The JSON object.
	 * @return {CellSpacePartitioning} A reference to this spatial index.
	 */
	fromJSON( json ) {

		this.cells.length = 0;

		this.width = json.width;
		this.height = json.height;
		this.depth = json.depth;
		this.cellsX = json.cellsX;
		this.cellsY = json.cellsY;
		this.cellsZ = json.cellsZ;

		this._halfWidth = json._halfWidth;
		this._halfHeight = json._halfHeight;
		this._halfDepth = json._halfHeight;

		this._min.fromArray( json._min );
		this._max.fromArray( json._max );

		for ( let i = 0, l = json.cells.length; i < l; i ++ ) {

			this.cells.push( new Cell().fromJSON( json.cells[ i ] ) );

		}

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {CellSpacePartitioning} A reference to this cell space portioning.
	*/
	resolveReferences( entities ) {

		for ( let i = 0, l = this.cells.length; i < l; i ++ ) {

			this.cells[ i ].resolveReferences( entities );

		}

		return this;

	}

}

export { CellSpacePartitioning };
