import { GameEntity } from '../core/GameEntity.js';
import { MeshGeometry } from '../core/MeshGeometry.js';
import { BoundingSphere } from '../math/BoundingSphere.js';
import { Plane } from '../math/Plane.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Ray } from '../math/Ray.js';

const boundingSphere = new BoundingSphere();
const triangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
const intersectionPointBoundingVolume = new Vector3();
const rayLocal = new Ray();
const plane = new Plane();
const inverseMatrix = new Matrix4();

/**
* Class for representing an obstacle in 3D space.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments GameEntity
*/
class Obstacle extends GameEntity {

	/**
	* Constructs a new obstacle.
	*
	* @param {MeshGeometry} geometry - A geometry representing a mesh.
	*/
	constructor( geometry = new MeshGeometry() ) {

		super();

		this.geometry = geometry;

	}

	/**
	* Performs a ray intersection test with the geometry of the obstacle and stores
	* the intersection point in the given result vector. If no intersection is detected,
	* *null* is returned.
	*
	* @param {Ray} ray - The ray to test.
	* @param {Vector3} intersectionPoint - The intersection point.
	* @param {Vector3} normal - The normal vector of the respective triangle.
	* @return {Vector3} The result vector.
	*/
	intersectRay( ray, intersectionPoint, normal = null ) {

		const geometry = this.geometry;

		// check bounding sphere first in world space

		boundingSphere.copy( geometry.boundingSphere ).applyMatrix4( this.worldMatrix );

		if ( ray.intersectBoundingSphere( boundingSphere, intersectionPointBoundingVolume ) !== null ) {

			// transform the ray into the local space of the obstacle

			inverseMatrix.getInverse( this.worldMatrix );
			rayLocal.copy( ray ).applyMatrix4( inverseMatrix );

			// check AABB in local space since its more expensive to convert an AABB to world space than a bounding sphere

			if ( rayLocal.intersectAABB( geometry.aabb, intersectionPointBoundingVolume ) !== null ) {

				// now perform more expensive test with all triangles of the geometry

				const vertices = geometry.vertices;
				const indices = geometry.indices;

				if ( indices === null ) {

					// non-indexed geometry

					for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

						triangle.a.set( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
						triangle.b.set( vertices[ i + 3 ], vertices[ i + 4 ], vertices[ i + 5 ] );
						triangle.c.set( vertices[ i + 6 ], vertices[ i + 7 ], vertices[ i + 8 ] );

						if ( rayLocal.intersectTriangle( triangle, geometry.backfaceCulling, intersectionPoint ) !== null ) {

							// transform intersection point back to world space

							intersectionPoint.applyMatrix4( this.worldMatrix );

							// compute normal of triangle in world space if necessary

							if ( normal !== null ) {

								plane.fromCoplanarPoints( triangle.a, triangle.b, triangle.c );
								normal.copy( plane.normal );
								normal.transformDirection( this.worldMatrix );

							}

							return intersectionPoint;

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

						if ( rayLocal.intersectTriangle( triangle, geometry.backfaceCulling, intersectionPoint ) !== null ) {

							// transform intersection point back to world space

							intersectionPoint.applyMatrix4( this.worldMatrix );

							// compute normal of triangle in world space if necessary

							if ( normal !== null ) {

								plane.fromCoplanarPoints( triangle.a, triangle.b, triangle.c );
								normal.copy( plane.normal );
								normal.transformDirection( this.worldMatrix );

							}

							return intersectionPoint;

						}

					}

				}

			}

		}

		return null;

	}

}

export { Obstacle };
