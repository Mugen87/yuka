/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { AABB } from '../math/AABB.js';

class Cell {

	constructor( aabb = new AABB() ) {

		this.aabb = aabb;
		this.entities = new Set();

	}

	add( entity ) {

		this.entities.add( entity );

	}

	remove( entity ) {

		this.entities.delete( entity );

	}

	empty() {

		return this.entities.size === 0;

	}

	intersects( aabb ) {

		return this.aabb.intersectsAABB( aabb );

	}

}

export { Cell };
