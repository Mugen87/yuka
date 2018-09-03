/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Plane.js
 *
 */

import { Vector3 } from './Vector3.js';

const v1 = new Vector3();
const v2 = new Vector3();

class Plane {

	constructor( normal = new Vector3( 0, 0, 1 ), constant = 0 ) {

		this.normal = normal;
		this.constant = constant;

	}

	set( normal, constant ) {

		this.normal = normal;
		this.constant = constant;

		return this;

	}

	copy( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	fromNormalAndCoplanarPoint( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );

		return this;

	}

	fromCoplanarPoints( a, b, c ) {

		v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();

		this.fromNormalAndCoplanarPoint( v1, a );

		return this;

	}

	equals( plane ) {

		return plane.normal.equals( this.normal ) && plane.constant === this.constant;

	}

}

export { Plane };
