/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Sphere.js
 *
 */

import { Vector3 } from './Vector3.js';

class BoundingSphere {

	constructor( center = new Vector3(), radius = 0 ) {

		this.center = center;
		this.radius = radius;

	}

	set( center, radius ) {

		this.center = center;
		this.radius = radius;

		return this;

	}

	copy( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	containsPoint( point ) {

		return ( point.squaredDistanceTo( this.center ) <= ( this.radius * this.radius ) );

	}

	intersectsBoundingSphere( sphere ) {

		const radius = this.radius + sphere.radius;

		return ( sphere.center.squaredDistanceTo( this.center ) <= ( radius * radius ) );

	}

	equals( sphere ) {

		return ( sphere.center.equals( this.center ) ) && ( sphere.radius === this.radius );

	}

}

export { BoundingSphere };
