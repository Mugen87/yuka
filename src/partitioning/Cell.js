/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { AABB } from '../math/AABB.js';

class Cell {

	constructor( aabb = new AABB() ) {

		this.aabb = aabb;
		this.entities = new Array();

	}

	add( entity ) {

		this.entities.push( entity );

	}

	remove( entity ) {

		const index = this.entities.indexOf( entity );
		this.entities.splice( index, 1 );

	}

	empty() {

		return this.entities.length === 0;

	}

	intersects( aabb ) {

		return this.aabb.intersectsAABB( aabb );

	}

}

export { Cell };
