import { MathUtils } from './MathUtils.js';
import { Matrix3 } from './Matrix3.js';
import { Vector3 } from './Vector3.js';
import { ConvexHull } from './ConvexHull.js';

const eigenDecomposition = {
	unitary: new Matrix3(),
	diagonal: new Matrix3()
};

const a = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

const b = {
	c: null, // center
	u: [ new Vector3(), new Vector3(), new Vector3() ], // basis vectors
	e: [] // half width
};

const R = [[], [], []];
const AbsR = [[], [], []];
const t = [];

const xAxis = new Vector3();
const yAxis = new Vector3();
const zAxis = new Vector3();
const v1 = new Vector3();
const closestPoint = new Vector3();

/**
* Class representing an oriented bounding box (OBB). Similar to an AABB, it's a
* rectangular block but with an arbitrary orientation. When using {@link OBB#fromPoints},
* the implementation tries to provide a tight-fitting oriented bounding box. In
* many cases, the result is better than an AABB or bounding sphere but worse than a
* convex hull. However, it's more efficient to work with OBBs compared to convex hulls.
* In general, OBB's are a good compromise between performance and tightness.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class OBB {

	/**
	* Constructs a new OBB with the given values.
	*
	* @param {Vector3} center - The center of this OBB.
	* @param {Vector3} halfSizes - The half sizes of the OBB (defines its width, height and depth).
	* @param {Matrix3} rotation - The rotation of this OBB.
	*/
	constructor( center = new Vector3(), halfSizes = new Vector3(), rotation = new Matrix3() ) {

		/**
		* The center of this OBB.
		* @type {Vector3}
		*/
		this.center = center;

		/**
		* The half sizes of the OBB (defines its width, height and depth).
		* @type {Vector3}
		*/
		this.halfSizes = halfSizes;

		/**
		* The rotation of this OBB.
		* @type {Matrix3}
		*/
		this.rotation = rotation;

	}

	/**
	* Sets the given values to this OBB.
	*
	* @param {Vector3} center - The center of this OBB
	* @param {Vector3} halfSizes - The half sizes of the OBB (defines its width, height and depth).
	* @param {Matrix3} rotation - The rotation of this OBB.
	* @return {OBB} A reference to this OBB.
	*/
	set( center, halfSizes, rotation ) {

		this.center = center;
		this.halfSizes = halfSizes;
		this.rotation = rotation;

		return this;

	}

	/**
	* Copies all values from the given OBB to this OBB.
	*
	* @param {OBB} obb - The OBB to copy.
	* @return {OBB} A reference to this OBB.
	*/
	copy( obb ) {

		this.center.copy( obb.center );
		this.halfSizes.copy( obb.halfSizes );
		this.rotation.copy( obb.rotation );

		return this;

	}

	/**
	* Creates a new OBB and copies all values from this OBB.
	*
	* @return {OBB} A new OBB.
	*/
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	* Computes the size (width, height, depth) of this OBB and stores it into the given vector.
	*
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	getSize( result ) {

		return result.copy( this.halfSizes ).multiplyScalar( 2 );

	}

	/**
	* Ensures the given point is inside this OBB and stores
	* the result in the given vector.
	*
	* Reference: Closest Point on OBB to Point in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.1.4)
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	clampPoint( point, result ) {

		const halfSizes = this.halfSizes;

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// start at the center position of the OBB

		result.copy( this.center );

		// project the target onto the OBB axes and walk towards that point

		const x = MathUtils.clamp( v1.dot( xAxis ), - halfSizes.x, halfSizes.x );
		result.add( xAxis.multiplyScalar( x ) );

		const y = MathUtils.clamp( v1.dot( yAxis ), - halfSizes.y, halfSizes.y );
		result.add( yAxis.multiplyScalar( y ) );

		const z = MathUtils.clamp( v1.dot( zAxis ), - halfSizes.z, halfSizes.z );
		result.add( zAxis.multiplyScalar( z ) );

		return result;

	}

	/**
	* Returns true if the given point is inside this OBB.
	*
	* @param {Vector3} point - A point in 3D space.
	* @return {Boolean} Whether the given point is inside this OBB or not.
	*/
	containsPoint( point ) {

		v1.subVectors( point, this.center );
		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// project v1 onto each axis and check if these points lie inside the OBB

		return Math.abs( v1.dot( xAxis ) ) <= this.halfSizes.x &&
				Math.abs( v1.dot( yAxis ) ) <= this.halfSizes.y &&
				Math.abs( v1.dot( zAxis ) ) <= this.halfSizes.z;

	}

	/**
	* Returns true if the given AABB intersects this OBB.
	*
	* @param {AABB} aabb - The AABB to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsAABB( aabb ) {

		return this.intersectsOBB( obb.fromAABB( aabb ) );

	}

	/**
	* Returns true if the given bounding sphere intersects this OBB.
	*
	* @param {BoundingSphere} sphere - The bounding sphere to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsBoundingSphere( sphere ) {

		// find the point on the OBB closest to the sphere center

		this.clampPoint( sphere.center, closestPoint );

		// if that point is inside the sphere, the OBB and sphere intersect

		return closestPoint.squaredDistanceTo( sphere.center ) <= ( sphere.radius * sphere.radius );

	}

	/**
	* Returns true if the given OBB intersects this OBB.
	*
	* Reference: OBB-OBB Intersection in Real-Time Collision Detection
	* by Christer Ericson (chapter 4.4.1)
	*
	* @param {OBB} obb - The OBB to test.
	* @param {Number} epsilon - The epsilon (tolerance) value.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsOBB( obb, epsilon = Number.EPSILON ) {

		// prepare data structures (the code uses the same nomenclature like the reference)

		a.c = this.center;
		a.e[ 0 ] = this.halfSizes.x;
		a.e[ 1 ] = this.halfSizes.y;
		a.e[ 2 ] = this.halfSizes.z;
		this.rotation.extractBasis( a.u[ 0 ], a.u[ 1 ], a.u[ 2 ] );

		b.c = obb.center;
		b.e[ 0 ] = obb.halfSizes.x;
		b.e[ 1 ] = obb.halfSizes.y;
		b.e[ 2 ] = obb.halfSizes.z;
		obb.rotation.extractBasis( b.u[ 0 ], b.u[ 1 ], b.u[ 2 ] );

		// compute rotation matrix expressing b in a’s coordinate frame

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				R[ i ][ j ] = a.u[ i ].dot( b.u[ j ] );

			}

		}

		// compute translation vector

		v1.subVectors( b.c, a.c );

		// bring translation into a’s coordinate frame

		t[ 0 ] = v1.dot( a.u[ 0 ] );
		t[ 1 ] = v1.dot( a.u[ 1 ] );
		t[ 2 ] = v1.dot( a.u[ 2 ] );

		// compute common subexpressions. Add in an epsilon term to
		// counteract arithmetic errors when two edges are parallel and
		// their cross product is (near) null

		for ( let i = 0; i < 3; i ++ ) {

			for ( let j = 0; j < 3; j ++ ) {

				AbsR[ i ][ j ] = Math.abs( R[ i ][ j ] ) + epsilon;

			}

		}

		let ra, rb;

		// test axes L = A0, L = A1, L = A2

		for ( let i = 0; i < 3; i ++ ) {

			ra = a.e[ i ];
			rb = b.e[ 0 ] * AbsR[ i ][ 0 ] + b.e[ 1 ] * AbsR[ i ][ 1 ] + b.e[ 2 ] * AbsR[ i ][ 2 ];
			if ( Math.abs( t[ i ] ) > ra + rb ) return false;


		}

		// test axes L = B0, L = B1, L = B2

		for ( let i = 0; i < 3; i ++ ) {

			ra = a.e[ 0 ] * AbsR[ 0 ][ i ] + a.e[ 1 ] * AbsR[ 1 ][ i ] + a.e[ 2 ] * AbsR[ 2 ][ i ];
			rb = b.e[ i ];
			if ( Math.abs( t[ 0 ] * R[ 0 ][ i ] + t[ 1 ] * R[ 1 ][ i ] + t[ 2 ] * R[ 2 ][ i ] ) > ra + rb ) return false;

		}

		// test axis L = A0 x B0

		ra = a.e[ 1 ] * AbsR[ 2 ][ 0 ] + a.e[ 2 ] * AbsR[ 1 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 0 ][ 2 ] + b.e[ 2 ] * AbsR[ 0 ][ 1 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 0 ] - t[ 1 ] * R[ 2 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A0 x B1

		ra = a.e[ 1 ] * AbsR[ 2 ][ 1 ] + a.e[ 2 ] * AbsR[ 1 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 0 ][ 2 ] + b.e[ 2 ] * AbsR[ 0 ][ 0 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 1 ] - t[ 1 ] * R[ 2 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A0 x B2

		ra = a.e[ 1 ] * AbsR[ 2 ][ 2 ] + a.e[ 2 ] * AbsR[ 1 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 0 ][ 1 ] + b.e[ 1 ] * AbsR[ 0 ][ 0 ];
		if ( Math.abs( t[ 2 ] * R[ 1 ][ 2 ] - t[ 1 ] * R[ 2 ][ 2 ] ) > ra + rb ) return false;

		// test axis L = A1 x B0

		ra = a.e[ 0 ] * AbsR[ 2 ][ 0 ] + a.e[ 2 ] * AbsR[ 0 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 1 ][ 2 ] + b.e[ 2 ] * AbsR[ 1 ][ 1 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 0 ] - t[ 2 ] * R[ 0 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A1 x B1

		ra = a.e[ 0 ] * AbsR[ 2 ][ 1 ] + a.e[ 2 ] * AbsR[ 0 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 1 ][ 2 ] + b.e[ 2 ] * AbsR[ 1 ][ 0 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 1 ] - t[ 2 ] * R[ 0 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A1 x B2

		ra = a.e[ 0 ] * AbsR[ 2 ][ 2 ] + a.e[ 2 ] * AbsR[ 0 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 1 ][ 1 ] + b.e[ 1 ] * AbsR[ 1 ][ 0 ];
		if ( Math.abs( t[ 0 ] * R[ 2 ][ 2 ] - t[ 2 ] * R[ 0 ][ 2 ] ) > ra + rb ) return false;

		// test axis L = A2 x B0

		ra = a.e[ 0 ] * AbsR[ 1 ][ 0 ] + a.e[ 1 ] * AbsR[ 0 ][ 0 ];
		rb = b.e[ 1 ] * AbsR[ 2 ][ 2 ] + b.e[ 2 ] * AbsR[ 2 ][ 1 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 0 ] - t[ 0 ] * R[ 1 ][ 0 ] ) > ra + rb ) return false;

		// test axis L = A2 x B1

		ra = a.e[ 0 ] * AbsR[ 1 ][ 1 ] + a.e[ 1 ] * AbsR[ 0 ][ 1 ];
		rb = b.e[ 0 ] * AbsR[ 2 ][ 2 ] + b.e[ 2 ] * AbsR[ 2 ][ 0 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 1 ] - t[ 0 ] * R[ 1 ][ 1 ] ) > ra + rb ) return false;

		// test axis L = A2 x B2

		ra = a.e[ 0 ] * AbsR[ 1 ][ 2 ] + a.e[ 1 ] * AbsR[ 0 ][ 2 ];
		rb = b.e[ 0 ] * AbsR[ 2 ][ 1 ] + b.e[ 1 ] * AbsR[ 2 ][ 0 ];
		if ( Math.abs( t[ 1 ] * R[ 0 ][ 2 ] - t[ 0 ] * R[ 1 ][ 2 ] ) > ra + rb ) return false;

		// since no separating axis is found, the OBBs must be intersecting

		return true;

	}

	/**
	* Returns true if the given plane intersects this OBB.
	*
	* Reference: Testing Box Against Plane in Real-Time Collision Detection
	* by Christer Ericson (chapter 5.2.3)
	*
	* @param {Plane} plane - The plane to test.
	* @return {Boolean} The result of the intersection test.
	*/
	intersectsPlane( plane ) {

		this.rotation.extractBasis( xAxis, yAxis, zAxis );

		// compute the projection interval radius of this OBB onto L(t) = this->center + t * p.normal;

		const r = this.halfSizes.x * Math.abs( plane.normal.dot( xAxis ) ) +
				this.halfSizes.y * Math.abs( plane.normal.dot( yAxis ) ) +
				this.halfSizes.z * Math.abs( plane.normal.dot( zAxis ) );

		// compute distance of the OBB's center from the plane

		const d = plane.normal.dot( this.center ) - plane.constant;

		// Intersection occurs when distance d falls within [-r,+r] interval

		return Math.abs( d ) <= r;

	}

	/**
	* Computes the OBB from an AABB.
	*
	* @param {AABB} aabb - The AABB.
	* @return {OBB} A reference to this OBB.
	*/
	fromAABB( aabb ) {

		aabb.getCenter( this.center );

		aabb.getSize( this.halfSizes ).multiplyScalar( 0.5 );

		this.rotation.identity();

		return this;

	}

	/**
	* Computes the minimum enclosing OBB for the given set of points. The method is an
	* implementation of {@link http://gamma.cs.unc.edu/users/gottschalk/main.pdf Collision Queries using Oriented Bounding Boxes}
	* by Stefan Gottschalk.
	* According to the dissertation, the quality of the fitting process varies from
	* the respective input. This method uses the best approach by computing the
	* covariance matrix based on the triangles of the convex hull (chapter 3.4.3).
	*
	* However, the implementation is susceptible to {@link https://en.wikipedia.org/wiki/Regular_polygon regular polygons}
	* like cubes or spheres. For such shapes, it's recommended to verify the quality
	* of the produced OBB. Consider to use an AABB or bounding sphere if the result
	* is not satisfying.
	*
	* @param {Array<Vector3>} points - An array of 3D vectors representing points in 3D space.
	* @return {OBB} A reference to this OBB.
	*/
	fromPoints( points ) {

		const convexHull = new ConvexHull().fromPoints( points );

		// 1. iterate over all faces of the convex hull and triangulate

		const faces = convexHull.faces;
		const edges = new Array();
		const triangles = new Array();

		for ( let i = 0, il = faces.length; i < il; i ++ ) {

			const face = faces[ i ];
			let edge = face.edge;

			edges.length = 0;

			// gather edges

			do {

				edges.push( edge );

				edge = edge.next;

			} while ( edge !== face.edge );

			// triangulate

			const triangleCount = ( edges.length - 2 );

			for ( let j = 1, jl = triangleCount; j <= jl; j ++ ) {

				const v1 = edges[ 0 ].vertex;
				const v2 = edges[ j + 0 ].vertex;
				const v3 = edges[ j + 1 ].vertex;

				triangles.push( v1.x, v1.y, v1.z );
				triangles.push( v2.x, v2.y, v2.z );
				triangles.push( v3.x, v3.y, v3.z );

			}

		}

		// 2. build covariance matrix

		const p = new Vector3();
		const q = new Vector3();
		const r = new Vector3();

		const qp = new Vector3();
		const rp = new Vector3();

		const v = new Vector3();

		const mean = new Vector3();
		const weightedMean = new Vector3();
		let areaSum = 0;

		let cxx, cxy, cxz, cyy, cyz, czz;
		cxx = cxy = cxz = cyy = cyz = czz = 0;

		for ( let i = 0, l = triangles.length; i < l; i += 9 ) {

			p.fromArray( triangles, i );
			q.fromArray( triangles, i + 3 );
			r.fromArray( triangles, i + 6 );

			mean.set( 0, 0, 0 );
			mean.add( p ).add( q ).add( r ).divideScalar( 3 );

			qp.subVectors( q, p );
			rp.subVectors( r, p );

			const area = v.crossVectors( qp, rp ).length() / 2; // .length() represents the frobenius norm here
			weightedMean.add( v.copy( mean ).multiplyScalar( area ) );

			areaSum += area;

			cxx += ( 9.0 * mean.x * mean.x + p.x * p.x + q.x * q.x + r.x * r.x ) * ( area / 12 );
			cxy += ( 9.0 * mean.x * mean.y + p.x * p.y + q.x * q.y + r.x * r.y ) * ( area / 12 );
			cxz += ( 9.0 * mean.x * mean.z + p.x * p.z + q.x * q.z + r.x * r.z ) * ( area / 12 );
			cyy += ( 9.0 * mean.y * mean.y + p.y * p.y + q.y * q.y + r.y * r.y ) * ( area / 12 );
			cyz += ( 9.0 * mean.y * mean.z + p.y * p.z + q.y * q.z + r.y * r.z ) * ( area / 12 );
			czz += ( 9.0 * mean.z * mean.z + p.z * p.z + q.z * q.z + r.z * r.z ) * ( area / 12 );

		}

		weightedMean.divideScalar( areaSum );

		cxx /= areaSum;
		cxy /= areaSum;
		cxz /= areaSum;
		cyy /= areaSum;
		cyz /= areaSum;
		czz /= areaSum;

		cxx -= weightedMean.x * weightedMean.x;
		cxy -= weightedMean.x * weightedMean.y;
		cxz -= weightedMean.x * weightedMean.z;
		cyy -= weightedMean.y * weightedMean.y;
		cyz -= weightedMean.y * weightedMean.z;
		czz -= weightedMean.z * weightedMean.z;

		const covarianceMatrix = new Matrix3();

		covarianceMatrix.elements[ 0 ] = cxx;
		covarianceMatrix.elements[ 1 ] = cxy;
		covarianceMatrix.elements[ 2 ] = cxz;
		covarianceMatrix.elements[ 3 ] = cxy;
		covarianceMatrix.elements[ 4 ] = cyy;
		covarianceMatrix.elements[ 5 ] = cyz;
		covarianceMatrix.elements[ 6 ] = cxz;
		covarianceMatrix.elements[ 7 ] = cyz;
		covarianceMatrix.elements[ 8 ] = czz;

		// 3. compute rotation, center and half sizes

		covarianceMatrix.eigenDecomposition( eigenDecomposition );

		const unitary = eigenDecomposition.unitary;

		const v1 = new Vector3();
		const v2 = new Vector3();
		const v3 = new Vector3();

		unitary.extractBasis( v1, v2, v3 );

		let u1 = - Infinity;
		let u2 = - Infinity;
		let u3 = - Infinity;
		let l1 = Infinity;
		let l2 = Infinity;
		let l3 = Infinity;

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			const p = points[ i ];

			u1 = Math.max( v1.dot( p ), u1 );
			u2 = Math.max( v2.dot( p ), u2 );
			u3 = Math.max( v3.dot( p ), u3 );

			l1 = Math.min( v1.dot( p ), l1 );
			l2 = Math.min( v2.dot( p ), l2 );
			l3 = Math.min( v3.dot( p ), l3 );

		}

		v1.multiplyScalar( 0.5 * ( l1 + u1 ) );
		v2.multiplyScalar( 0.5 * ( l2 + u2 ) );
		v3.multiplyScalar( 0.5 * ( l3 + u3 ) );

		// center

		this.center.add( v1 ).add( v2 ).add( v3 );

		this.halfSizes.x = u1 - l1;
		this.halfSizes.y = u2 - l2;
		this.halfSizes.z = u3 - l3;

		// halfSizes

		this.halfSizes.multiplyScalar( 0.5 );

		// rotation

		this.rotation.copy( unitary );

		return this;

	}

	/**
	* Returns true if the given OBB is deep equal with this OBB.
	*
	* @param {OBB} obb - The OBB to test.
	* @return {Boolean} The result of the equality test.
	*/
	equals( obb ) {

		return obb.center.equals( this.center ) &&
				obb.halfSizes.equals( this.halfSizes ) &&
				obb.rotation.equals( this.rotation );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			center: this.center.toArray( new Array() ),
			halfSizes: this.halfSizes.toArray( new Array() ),
			rotation: this.rotation.toArray( new Array() )
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {OBB} A reference to this OBB.
	*/
	fromJSON( json ) {

		this.center.fromArray( json.center );
		this.halfSizes.fromArray( json.halfSizes );
		this.rotation.fromArray( json.rotation );

		return this;

	}

}

const obb = new OBB();

export { OBB };
