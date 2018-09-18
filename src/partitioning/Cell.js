/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { AABB } from '../math/AABB.js';

class Cell {

	constructor( aabb = new AABB() ) {

		this.aabb = aabb;
		this.entries = new Array();

	}

	add( entry ) {

		this.entries.push( entry );

		return this;

	}

	remove( entry ) {

		const index = this.entries.indexOf( entry );
		this.entries.splice( index, 1 );

		return this;

	}

	makeEmpty() {

		this.entries.length = 0;

		return this;

	}

	empty() {

		return this.entries.length === 0;

	}

	intersects( aabb ) {

		return this.aabb.intersectsAABB( aabb );

	}

}

export { Cell };
