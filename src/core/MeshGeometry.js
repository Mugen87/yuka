import { AABB } from '../math/AABB.js';
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

		// prepare AABB for "expand" operations

		aabb.min.set( Infinity, Infinity, Infinity );
		aabb.max.set( - Infinity, - Infinity, - Infinity );

		//

		for ( let i = 0, l = vertices.length; i < l; i += 3 ) {

			vertex.x = vertices[ i ];
			vertex.y = vertices[ i + 1 ];
			vertex.z = vertices[ i + 2 ];

			aabb.expand( vertex );

		}

		return this;

	}

}

export { MeshGeometry };
