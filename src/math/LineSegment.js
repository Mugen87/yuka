/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Reference: https://github.com/mrdoob/three.js/blob/master/src/math/Line3.js
 *
 */

import { Vector3 } from './Vector3.js';
import { _Math } from './Math.js';

const p1 = new Vector3();
const p2 = new Vector3();

class LineSegment {

	constructor( from = new Vector3(), to = new Vector3() ) {

		this.from = from;
		this.to = to;

	}

	set( from, to ) {

		this.from = from;
		this.to = to;

		return this;

	}

	copy( lineSegment ) {

		this.from.copy( lineSegment.from );
		this.to.copy( lineSegment.to );

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

	delta( result ) {

		return result.subVectors( this.to, this.from );

	}

	at( t, result ) {

		return this.delta( result ).multiplyScalar( t ).add( this.from );

	}

	closestPointToPoint( point, clampToLine, result ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		return this.at( t, result );

	}

	closestPointToPointParameter( point, clampToLine = true ) {

		p1.subVectors( point, this.from );
		p2.subVectors( this.to, this.from );

		const dotP2P2 = p2.dot( p2 );
		const dotP2P1 = p2.dot( p1 );

		let t = dotP2P1 / dotP2P2;

		if ( clampToLine ) t = _Math.clamp( t, 0, 1 );

		return t;

	}

	equals( lineSegment ) {

		return lineSegment.from.equals( this.from ) && lineSegment.to.equals( this.to );

	}

}

export { LineSegment };
