import { AABB } from './AABB.js';
import { Vector3 } from './Vector3.js';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();

const xAxis = new Vector3( 1, 0, 0 );
const yAxis = new Vector3( 0, 1, 0 );
const zAxis = new Vector3( 0, 0, 1 );

const triangle = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
const intersection = new Vector3();
const intersections = new Array();

/**
* Class representing a bounding volume hierarchy. The current implementation
* represents single BVH nodes as AABBs. It accepts arbitrary branching factors
* and can subdivide the given geometry until a defined hierarchy depth has been reached.
* Besides, the hierarchy construction is performed top-down and the algorithm only
* performs splits along the cardinal axes.
*
* Reference: Bounding Volume Hierarchies in Real-Time Collision Detection
* by Christer Ericson (chapter 6).
*
* @author {@link https://github.com/robp94|robp94}
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BVH {

	/**
	* Constructs a new BVH.
	*
	* @param {Number} branchingFactor - The branching factor.
	* @param {Number} primitivesPerNode - The minimum amount of primitives per BVH node.
	* @param {Number} depth - The maximum hierarchical depth.
	*/
	constructor( branchingFactor = 2, primitivesPerNode = 1, depth = 10 ) {

		/**
		* The branching factor (how many nodes per level).
		* @type {Number}
		* @default 2
		*/
		this.branchingFactor = branchingFactor;

		/**
		* The minimum amount of primitives per BVH node.
		* @type {Number}
		* @default 10
		*/
		this.primitivesPerNode = primitivesPerNode;

		/**
		* The maximum hierarchical depth.
		* @type {Number}
		* @default 10
		*/
		this.depth = depth;

		/**
		* The root BVH node.
		* @type {BVHNode}
		* @default null
		*/
		this.root = null;

	}

	/**
	* Computes a BVH for the given mesh geometry.
	*
	* @param {MeshGeometry} geometry - The mesh geometry.
	* @return {BVH} A reference to this BVH.
	*/
	fromMeshGeometry( geometry ) {

		this.root = new BVHNode();

		// primitives

		if ( geometry.indices !== null ) geometry = geometry.toTriangleSoup();

		const vertices = geometry.vertices;

		for ( let i = 0, l = vertices.length; i < l; i ++ ) {

			this.root.primitives.push( vertices[ i ] );

		}

		// centroids

		const primitives = this.root.primitives;

		for ( let i = 0, l = primitives.length; i < l; i += 9 ) {

			v1.fromArray( primitives, i );
			v2.fromArray( primitives, i + 3 );
			v3.fromArray( primitives, i + 6 );

			v1.add( v2 ).add( v3 ).divideScalar( 3 );

			this.root.centroids.push( v1.x, v1.y, v1.z );

		}

		// build

		this.root.build( this.branchingFactor, this.primitivesPerNode, this.depth, 1 );

		return this;

	}

	/**
	* Executes the given callback for each node of the BVH.
	*
	* @param {Function} callback - The callback to execute.
	* @return {BVH} A reference to this BVH.
	*/
	traverse( callback ) {

		this.root.traverse( callback );

		return this;

	}

}

/**
* A single node in a bounding volume hierarchy (BVH).
*
* @author {@link https://github.com/robp94|robp94}
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BVHNode {

	/**
	* Constructs a BVH node.
	*/
	constructor() {

		/**
		* The parent BVH node.
		* @type {BVHNode}
		* @default null
		*/
		this.parent = null;

		/**
		* The child BVH nodes.
		* @type {Array<BVHNode>}
		*/
		this.children = new Array();

		/**
		* The bounding volume of this BVH node.
		* @type {AABB}
		*/
		this.boundingVolume = new AABB();

		/**
		* The primitives (triangles) of this BVH node.
		* Only filled for leaf nodes.
		* @type {Array<Number>}
		*/
		this.primitives = new Array();

		/**
		* The centroids of the node's triangles.
		* Only filled for leaf nodes.
		* @type {Array<Number>}
		*/
		this.centroids = new Array();

	}

	/**
	* Returns true if this BVH node is a root node.
	*
	* @return {Boolean} Whether this BVH node is a root node or not.
	*/
	root() {

		return this.parent === null;

	}

	/**
	* Returns true if this BVH node is a leaf node.
	*
	* @return {Boolean} Whether this BVH node is a leaf node or not.
	*/
	leaf() {

		return this.children.length === 0;

	}

	/**
	* Returns the depth of this BVH node in its hierarchy.
	*
	* @return {Number} The hierarchical depth of this BVH node.
	*/
	getDepth() {

		let depth = 0;

		let parent = this.parent;

		while ( parent !== null ) {

			parent = parent.parent;
			depth ++;

		}

		return depth;

	}

	/**
	* Executes the given callback for this BVH node and its ancestors.
	*
	* @param {Function} callback - The callback to execute.
	* @return {BVHNode} A reference to this BVH node.
	*/
	traverse( callback ) {

		callback( this );

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			 this.children[ i ].traverse( callback );

		}

		return this;

	}

	/**
	* Builds this BVH node. That means the respective bounding volume
	* is computed and the node's primitives are distributed under new child nodes.
	* This only happens if the maximum hierarchical depth is not yet reached and
	* the node does contain enough primitives required for a split.
	*
	* @param {Number} branchingFactor - The branching factor.
	* @param {Number} primitivesPerNode - The minimum amount of primitives per BVH node.
	* @param {Number} maxDepth - The maximum  hierarchical depth.
	* @param {Number} currentDepth - The current hierarchical depth.
	* @return {BVHNode} A reference to this BVH node.
	*/
	build( branchingFactor, primitivesPerNode, maxDepth, currentDepth ) {

		this.computeBoundingVolume();

		// check depth and primitive count

		const primitiveCount = this.primitives.length / 9;
		const newPrimitiveCount = Math.floor( primitiveCount / branchingFactor );

		if ( ( currentDepth <= maxDepth ) && ( newPrimitiveCount >= primitivesPerNode ) ) {

			// split (distribute primitives on new child BVH nodes)

			this.split( branchingFactor );

			// proceed with build on the next hierarchy level

			for ( let i = 0; i < branchingFactor; i ++ ) {

				this.children[ i ].build( branchingFactor, primitivesPerNode, maxDepth, currentDepth + 1 );

			}

		}

		return this;

	}

	/**
	* Computes the AABB for this BVH node.
	*
	* @return {BVHNode} A reference to this BVH node.
	*/
	computeBoundingVolume() {

		const primitives = this.primitives;

		const aabb = this.boundingVolume;

		// compute AABB

		aabb.min.set( Infinity, Infinity, Infinity );
		aabb.max.set( - Infinity, - Infinity, - Infinity );

		for ( let i = 0, l = primitives.length; i < l; i += 3 ) {

			v1.x = primitives[ i ];
			v1.y = primitives[ i + 1 ];
			v1.z = primitives[ i + 2 ];

			aabb.expand( v1 );

		}

		return this;

	}

	/**
	* Computes the split axis. Right now, only the cardinal axes
	* are potential split axes.
	*
	* @return {Vector3} The split axis.
	*/
	computeSplitAxis() {

		let maxX, maxY, maxZ = maxY = maxX = - Infinity;
		let minX, minY, minZ = minY = minX = Infinity;

		const centroids = this.centroids;

		for ( let i = 0, l = centroids.length; i < l; i += 3 ) {

			const x = centroids[ i ];
			const y = centroids[ i + 1 ];
			const z = centroids[ i + 2 ];

			if ( x > maxX ) {

				maxX = x;

			}

			if ( y > maxY ) {

				maxY = y;

			}

			if ( z > maxZ ) {

				maxZ = z;

			}

			if ( x < minX ) {

				minX = x;

			}

			if ( y < minY ) {

				minY = y;

			}

			if ( z < minZ ) {

				minZ = z;

			}

		}

		const rangeX = maxX - minX;
		const rangeY = maxY - minY;
		const rangeZ = maxZ - minZ;

		if ( rangeX > rangeY && rangeX > rangeZ ) {

			return xAxis;

		} else if ( rangeY > rangeZ ) {

			return yAxis;

		} else {

			return zAxis;

		}

	}

	/**
	* Splits the node and distributes node's primitives over new child nodes.
	*
	* @param {Number} branchingFactor - The branching factor.
	* @return {BVHNode} A reference to this BVH node.
	*/
	split( branchingFactor ) {

		const centroids = this.centroids;
		const primitives = this.primitives;

		// create (empty) child BVH nodes

		for ( let i = 0; i < branchingFactor; i ++ ) {

			this.children[ i ] = new BVHNode();
			this.children[ i ].parent = this;

		}

		// sort primitives along split axis

		const axis = this.computeSplitAxis();
		const sortedPrimitiveIndices = new Array();

		for ( let i = 0, l = centroids.length; i < l; i += 3 ) {

			v1.fromArray( centroids, i );

			// the result from the dot product is our sort criterion.
			// it represents the projection of the centroid on the split axis

			const p = v1.dot( axis );
			const primitiveIndex = i / 3;

			sortedPrimitiveIndices.push( { index: primitiveIndex, p: p } );

		}

		sortedPrimitiveIndices.sort( sortPrimitives );

		// distribute data

		const primitveCount = sortedPrimitiveIndices.length;
		const primitivesPerChild = Math.floor( primitveCount / branchingFactor );

		var childIndex = 0;
		var primitivesIndex = 0;

		for ( let i = 0; i < primitveCount; i ++ ) {

			// selected child

			primitivesIndex ++;

			// check if we try to add more primitives to a child than "primitivesPerChild" defines.
			// move primitives to the next child

			if ( primitivesIndex > primitivesPerChild ) {

				// ensure "childIndex" does not overflow (meaning the last child takes all remaining primitives)

				if ( childIndex < ( branchingFactor - 1 ) ) {

					primitivesIndex = 1; // reset primitive index
					childIndex ++; // raise child index

				}

			}

			const child = this.children[ childIndex ];

			// move data to the next level

			// 1. primitives

			const primitiveIndex = sortedPrimitiveIndices[ i ].index;
			const stride = primitiveIndex * 9; // remember the "primitives" array holds raw vertex data defining triangles

			v1.fromArray( primitives, stride );
			v2.fromArray( primitives, stride + 3 );
			v3.fromArray( primitives, stride + 6 );

			child.primitives.push( v1.x, v1.y, v1.z );
			child.primitives.push( v2.x, v2.y, v2.z );
			child.primitives.push( v3.x, v3.y, v3.z );

			// 2. centroid

			v1.fromArray( centroids, primitiveIndex * 3 );

			child.centroids.push( v1.x, v1.y, v1.z );

		}

		// remove centroids/primitives after split from this node

		this.centroids.length = 0;
		this.primitives.length = 0;

		return this;

	}

	/**
	* Performs a ray/BVH node intersection test and stores the closest intersection point
	* to the given 3D vector. If no intersection is detected, *null* is returned.
	*
	* @param {Ray} ray - The ray.
	* @param {Vector3} result - The result vector.
	* @return {Vector3} The result vector.
	*/
	intersectRay( ray, result ) {

		// gather all intersection points along the hierarchy

		if ( ray.intersectAABB( this.boundingVolume, result ) !== null ) {

			if ( this.leaf() === true ) {

				const vertices = this.primitives;

				for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

					// remember: we assume primitives are triangles

					triangle.a.fromArray( vertices, i );
					triangle.b.fromArray( vertices, i + 3 );
					triangle.c.fromArray( vertices, i + 6 );

					if ( ray.intersectTriangle( triangle, true, result ) !== null ) {

						intersections.push( result.clone() );

					}

				}

			} else {

				// process childs

				for ( let i = 0, l = this.children.length; i < l; i ++ ) {

					this.children[ i ].intersectRay( ray, result );

				}

			}

		}

		// determine the closest intersection point in the root node (so after
		// the hierarchy was processed)

		if ( this.root() === true ) {

			if ( intersections.length > 0 ) {

				let minDistance = Infinity;

				for ( let i = 0, l = intersections.length; i < l; i ++ ) {

					const squaredDistance = ray.origin.squaredDistanceTo( intersections[ i ] );

					if ( squaredDistance < minDistance ) {

						minDistance = squaredDistance;
						result.copy( intersections[ i ] );

					}

				}

				// reset array

				intersections.length = 0;

				// return closest intersection point

				return result;

			} else {

				// no intersection detected

				return null;

			}

		} else {

			// always return null for non-root nodes

			return null;

		}

	}

	/**
	* Performs a ray/BVH node intersection test. Returns either true or false if
	* there is a intersection or not.
	*
	* @param {Ray} ray - The ray.
	* @return {boolean} Whether there is an intersection or not.
	*/
	intersectsRay( ray ) {

		if ( ray.intersectAABB( this.boundingVolume, intersection ) !== null ) {

			if ( this.leaf() === true ) {

				const vertices = this.primitives;

				for ( let i = 0, l = vertices.length; i < l; i += 9 ) {

					// remember: we assume primitives are triangles

					triangle.a.fromArray( vertices, i );
					triangle.b.fromArray( vertices, i + 3 );
					triangle.c.fromArray( vertices, i + 6 );

					if ( ray.intersectTriangle( triangle, true, intersection ) !== null ) {

						return true;

					}

				}

				return false;

			} else {

				// process child BVH nodes

				for ( let i = 0, l = this.children.length; i < l; i ++ ) {

					if ( this.children[ i ].intersectsRay( ray ) === true ) {

						return true;

					}

				}

				return false;

			}

		} else {

			return false;

		}

	}

}

//

function sortPrimitives( a, b ) {

	return a.p - b.p;

}

export { BVH, BVHNode };
