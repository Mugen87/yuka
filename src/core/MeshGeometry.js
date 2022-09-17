import { AABB } from '../math/AABB.js';
import { BoundingSphere } from '../math/BoundingSphere.js';
import { Vector3 } from '../math/Vector3.js';
import { Ray } from '../math/Ray.js';
import { Plane } from '../math/Plane.js';
import { Matrix4 } from '../math/Matrix4.js';

const boundingSphere = new BoundingSphere();
const triangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
const rayLocal = new Ray();
const plane = new Plane();
const inverseMatrix = new Matrix4();
const closestIntersectionPoint = new Vector3();
const closestTriangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };

/**
* Class for representing a polygon mesh. The faces consist of triangles.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class MeshGeometry {

	/**
	* Constructs a new mesh geometry.
	*
	* @param {TypedArray} vertices - The vertex buffer (Float32Array).
	* @param {TypedArray} indices - The index buffer (Uint16Array/Uint32Array).
	*/
	constructor( vertices = new Float32Array(), indices = null ) {

		/**
		* The vertex buffer.
		* @type {Float32Array}
		*/
		this.vertices = vertices;

		/**
		* The index buffer.
		* @type {?(Uint16Array|?Uint32Array)}
		* @default null
		*/
		this.indices = indices;

		/**
		*  Whether back face culling is active or not. Only relevant for raycasting.
		* @type {Boolean}
		*/
		this.backfaceCulling = true;

		/**
		* An AABB enclosing the geometry.
		* @type {AABB}
		*/
		this.aabb = new AABB();

		/**
		* A bounding sphere enclosing the geometry.
		* @type {BoundingSphere}
		*/
		this.boundingSphere = new BoundingSphere();

		this.computeBoundingVolume();

	}

	/**
	* Computes the internal bounding volumes of this mesh geometry.
	*
	* @return {MeshGeometry} A reference to this mesh geometry.
	*/
	computeBoundingVolume() {

		const vertices = this.vertices;
		const vertex = new Vector3();

		const aabb = this.aabb;
		const boundingSphere = this.boundingSphere;

		// compute AABB

		aabb.min.set( Infinity, Infinity, Infinity );
		aabb.max.set( - Infinity, - Infinity, - Infinity );

		for ( let i = 0, l = vertices.length; i < l; i += 3 ) {

			vertex.x = vertices[ i ];
			vertex.y = vertices[ i + 1 ];
			vertex.z = vertices[ i + 2 ];

			aabb.expand( vertex );

		}

		// compute bounding sphere

		aabb.getCenter( boundingSphere.center );
		boundingSphere.radius = boundingSphere.center.distanceTo( aabb.max );

		return this;

	}

	/**
	 * Performs a ray intersection test with the geometry of the obstacle and stores
	 * the intersection point in the given result vector. If no intersection is detected,
	 * *null* is returned.
	 *
	 * @param {Ray} ray - The ray to test.
	 * @param {Matrix4} worldMatrix - The matrix that transforms the geometry to world space.
	 * @param {Boolean} closest - Whether the closest intersection point should be computed or not.
	 * @param {Vector3} intersectionPoint - The intersection point.
	 * @param {Vector3} normal - The normal vector of the respective triangle.
	 * @return {Vector3} The result vector.
	 */
	intersectRay( ray, worldMatrix, closest, intersectionPoint, normal = null ) {

		// check bounding sphere first in world space

		boundingSphere.copy( this.boundingSphere ).applyMatrix4( worldMatrix );

		if ( ray.intersectsBoundingSphere( boundingSphere ) ) {

			// transform the ray into the local space of the obstacle

			worldMatrix.getInverse( inverseMatrix );
			rayLocal.copy( ray ).applyMatrix4( inverseMatrix );

			// check AABB in local space since its more expensive to convert an AABB to world space than a bounding sphere

			if ( rayLocal.intersectsAABB( this.aabb ) ) {

				// now perform more expensive test with all triangles of the geometry

				const vertices = this.vertices;
				const indices = this.indices;

				let minDistance = Infinity;
				let found = false;

				if ( indices === null ) {

					// non-indexed geometry

					for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

						triangle.a.set( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
						triangle.b.set( vertices[ i + 3 ], vertices[ i + 4 ], vertices[ i + 5 ] );
						triangle.c.set( vertices[ i + 6 ], vertices[ i + 7 ], vertices[ i + 8 ] );

						if ( rayLocal.intersectTriangle( triangle, this.backfaceCulling, intersectionPoint ) !== null ) {

							if ( closest ) {

								const distance = intersectionPoint.squaredDistanceTo( rayLocal.origin );

								if ( distance < minDistance ) {

									minDistance = distance;

									closestIntersectionPoint.copy( intersectionPoint );
									closestTriangle.a.copy( triangle.a );
									closestTriangle.b.copy( triangle.b );
									closestTriangle.c.copy( triangle.c );
									found = true;

								}

							} else {

								found = true;
								break;

							}

						}

					}

				} else {

					// indexed geometry

					for ( let i = 0, l = indices.length; i < l; i += 3 ) {

						const a = indices[ i ];
						const b = indices[ i + 1 ];
						const c = indices[ i + 2 ];

						const stride = 3;

						triangle.a.set( vertices[ ( a * stride ) ], vertices[ ( a * stride ) + 1 ], vertices[ ( a * stride ) + 2 ] );
						triangle.b.set( vertices[ ( b * stride ) ], vertices[ ( b * stride ) + 1 ], vertices[ ( b * stride ) + 2 ] );
						triangle.c.set( vertices[ ( c * stride ) ], vertices[ ( c * stride ) + 1 ], vertices[ ( c * stride ) + 2 ] );

						if ( rayLocal.intersectTriangle( triangle, this.backfaceCulling, intersectionPoint ) !== null ) {

							if ( closest ) {

								const distance = intersectionPoint.squaredDistanceTo( rayLocal.origin );

								if ( distance < minDistance ) {

									minDistance = distance;

									closestIntersectionPoint.copy( intersectionPoint );
									closestTriangle.a.copy( triangle.a );
									closestTriangle.b.copy( triangle.b );
									closestTriangle.c.copy( triangle.c );
									found = true;

								}

							} else {

								found = true;
								break;

							}

						}

					}

				}

				// intersection was found

				if ( found ) {

					if ( closest ) {

						// restore closest intersection point and triangle

						intersectionPoint.copy( closestIntersectionPoint );
						triangle.a.copy( closestTriangle.a );
						triangle.b.copy( closestTriangle.b );
						triangle.c.copy( closestTriangle.c );

					}

					// transform intersection point back to world space

					intersectionPoint.applyMatrix4( worldMatrix );

					// compute normal of triangle in world space if necessary

					if ( normal !== null ) {

						plane.fromCoplanarPoints( triangle.a, triangle.b, triangle.c );
						normal.copy( plane.normal );
						normal.transformDirection( worldMatrix );

					}

					return intersectionPoint;

				}

			}

		}

		return null;

	}

	/**
	 * Returns a new geometry without containing indices. If the geometry is already
	 * non-indexed, the method performs no changes.
	 *
	 * @return {MeshGeometry} The new non-indexed geometry.
	 */
	toTriangleSoup() {

		const indices = this.indices;

		if ( indices ) {

			const vertices = this.vertices;
			const newVertices = new Float32Array( indices.length * 3 );

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				const a = indices[ i ];
				const stride = 3;

				newVertices[ i * stride ] = vertices[ a * stride ];
				newVertices[ ( i * stride ) + 1 ] = vertices[ ( a * stride ) + 1 ];
				newVertices[ ( i * stride ) + 2 ] = vertices[ ( a * stride ) + 2 ];

			}

			return new MeshGeometry( newVertices );

		} else {

			return this;

		}

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			type: this.constructor.name
		};

		json.indices = {
			type: this.indices ? this.indices.constructor.name : 'null',
			data: this.indices ? Array.from( this.indices ) : null
		};

		json.vertices = Array.from( this.vertices );
		json.backfaceCulling = this.backfaceCulling;
		json.aabb = this.aabb.toJSON();
		json.boundingSphere = this.boundingSphere.toJSON();

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {MeshGeometry} A reference to this mesh geometry.
	*/
	fromJSON( json ) {

		this.aabb = new AABB().fromJSON( json.aabb );
		this.boundingSphere = new BoundingSphere().fromJSON( json.boundingSphere );
		this.backfaceCulling = json.backfaceCulling;

		this.vertices = new Float32Array( json.vertices );

		switch ( json.indices.type ) {

			case 'Uint16Array':
				this.indices = new Uint16Array( json.indices.data );
				break;

			case 'Uint32Array':
				this.indices = new Uint32Array( json.indices.data );
				break;

			case 'null':
				this.indices = null;
				break;

		}

		return this;

	}

}

export { MeshGeometry };
