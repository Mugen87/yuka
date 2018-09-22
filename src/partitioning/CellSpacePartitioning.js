/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Cell } from './Cell.js';
import { AABB } from '../math/AABB.js';
import { Vector3 } from '../math/Vector3.js';

const clampedPosition = new Vector3();
const aabb = new AABB();
const contour = new Array();

class CellSpacePartitioning {

	constructor( width, height, depth, cellsX, cellsY, cellsZ ) {

		this.cells = new Array();

		this.width = width;
		this.height = height;
		this.depth = depth;

		this.halfWidth = width / 2;
		this.halfHeight = height / 2;
		this.halfDepth = depth / 2;

		this.min = new Vector3( - this.halfWidth, - this.halfHeight, - this.halfDepth );
		this.max = new Vector3( this.halfWidth, this.halfHeight, this.halfDepth );

		this.cellsX = cellsX;
		this.cellsY = cellsY;
		this.cellsZ = cellsZ;

		//

		const cellSizeX = width / cellsX;
		const cellSizeY = height / cellsY;
		const cellSizeZ = depth / cellsZ;

		for ( let i = 0; i < cellsX; i ++ ) {

			const x = ( i * cellSizeX ) - this.halfWidth;

			for ( let j = 0; j < cellsY; j ++ ) {

				const y = ( j * cellSizeY ) - this.halfHeight;

				for ( let k = 0; k < cellsZ; k ++ ) {

					const z = ( k * cellSizeZ ) - this.halfDepth;

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

	addEntityToPartition( entity, index ) {

		const cell = this.cells[ index ];
		cell.add( entity );

		return this;

	}

	removeEntityFromPartition( entity, index ) {

		const cell = this.cells[ index ];
		cell.remove( entity );

		return this;

	}

	getIndexForPosition( position ) {

		clampedPosition.copy( position ).clamp( this.min, this.max );

		let indexX = Math.abs( Math.floor( ( this.cellsX * ( clampedPosition.x + this.halfWidth ) ) / this.width ) );
		let indexY = Math.abs( Math.floor( ( this.cellsY * ( clampedPosition.y + this.halfHeight ) ) / this.height ) );
		let indexZ = Math.abs( Math.floor( ( this.cellsZ * ( clampedPosition.z + this.halfDepth ) ) / this.depth ) );

		// handle index overflow

		if ( indexX === this.cellsX ) indexX = this.cellsX - 1;
		if ( indexY === this.cellsY ) indexY = this.cellsY - 1;
		if ( indexZ === this.cellsZ ) indexZ = this.cellsZ - 1;

		// calculate final index

		return ( indexX * this.cellsY * this.cellsZ ) + ( indexY * this.cellsZ ) + indexZ;

	}

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

	makeEmpty() {

		const cells = this.cells;

		for ( let i = 0, l = cells.length; i < l; i ++ ) {

			cells[ i ].makeEmpty();

		}

		return this;

	}

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

}

export { CellSpacePartitioning };
