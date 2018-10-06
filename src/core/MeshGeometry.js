import { AABB } from '../math/AABB.js';
import { BoundingSphere } from '../math/BoundingSphere.js';
import { Vector3 } from '../math/Vector3.js';

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

		this.vertices = vertices;
		this.indices = indices;

		this.backfaceCulling = true;

		this.aabb = new AABB();
		this.boundingSphere = new BoundingSphere();

		this.computeBoundingVolume();

	}

	/**
	* Computes an AABB for this geometry.
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

}

export { MeshGeometry };
