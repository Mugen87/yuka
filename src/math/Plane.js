import { Vector3 } from './Vector3.js';

const v1 = new Vector3();
const v2 = new Vector3();
const d = new Vector3();

/**
* Class representing a plane in 3D space. The plane is specified in Hessian normal form.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Plane {

	/**
	* Constructs a new plane with the given values.
	*
	* @param {Vector3} normal - The normal vector of the plane.
	* @param {Number} constant - The distance of the plane from the origin.
	*/
	constructor( normal = new Vector3( 0, 0, 1 ), constant = 0 ) {

		/**
		* The normal vector of the plane.
		* @type {Vector3}
		*/
		this.normal = normal;

		/**
		* The distance of the plane from the origin.
		* @type {Number}
		*/
		this.constant = constant;

	}

	/**
	* Sets the given values to this plane.
	*
	* @param {Vector3} normal - The normal vector of the plane.
	* @param {Number} constant - The distance of the plane from the origin.
	* @return {Plane} A reference to this plane.
	*/
	set( normal, constant ) {

		this.normal = normal;
		this.constant = constant;

		return this;

	}

	/**
	* Copies all values from the given plane to this plane.
	*
	* @param {Plane} plane - The plane to copy.
	* @return {Plane} A reference to this plane.
	*/
	copy( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	}

	/**
	* Creates a new plane and copies all values from this plane.
	*
	* @return {Plane} A new plane.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the signed distance from the given 3D vector to this plane.
	* The sign of the distance indicates the half-space in which the points lies.
	* Zero means the point lies on the plane.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Number} The signed distance.
	*/
	distanceToPoint( point ) {

		return this.normal.dot( point ) + this.constant;

	}

	/**
	* Sets the values of the plane from the given normal vector and a coplanar point.
	*
	* @param {Vector3} normal - A normalized vector.
	* @param {Vector3} point - A coplanar point.
	* @return {Plane} A reference to this plane.
	*/
	fromNormalAndCoplanarPoint( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );

		return this;

	}

	/**
	* Sets the values of the plane from three given coplanar points.
	*
	* @param {Vector3} a - A coplanar point.
	* @param {Vector3} b - A coplanar point.
	* @param {Vector3} c - A coplanar point.
	* @return {Plane} A reference to this plane.
	*/
	fromCoplanarPoints( a, b, c ) {

		v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();

		this.fromNormalAndCoplanarPoint( v1, a );

		return this;

	}

	/**
	* Performs a plane/plane intersection test and stores the intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* Reference: Intersection of Two Planes in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.4.4)
	*
	* @param {Plane} plane - The plane to test.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectPlane( plane, result ) {

		// compute direction of intersection line

		d.crossVectors( this.normal, plane.normal );

		// if d is zero, the planes are parallel (and separated)
		// or coincident, so they’re not considered intersecting

		const denom = d.dot( d );

		if ( denom === 0 ) return null;

		// compute point on intersection line

		v1.copy( plane.normal ).multiplyScalar( this.constant );
		v2.copy( this.normal ).multiplyScalar( plane.constant );

		result.crossVectors( v1.sub( v2 ), d ).divideScalar( denom );

		return result;

	}

	/**
	* Returns true if the given plane intersects this plane.
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		const d = this.normal.dot( plane.normal );

		return ( Math.abs( d ) !== 1 );

	}

	/**
	* Projects the given point onto the plane. The result is written
	* to the given vector.
	*
	* @param {Vector3} point - The point to project onto the plane.
	* @param {Vector3} result - The projected point.
	* @return {Vector3} The projected point.
	*/
	projectPoint( point, result ) {

		v1.copy( this.normal ).multiplyScalar( this.distanceToPoint( point ) );

		result.subVectors( point, v1 );

		return result;

	}

	/**
	* Returns true if the given plane is deep equal with this plane.
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( plane ) {

		return plane.normal.equals( this.normal ) && plane.constant === this.constant;

	}

}

export { Plane };
