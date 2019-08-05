/**
 * @author robp94 / https://github.com/robp94
 */
const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const BVH = YUKA.BVH;
const BVHNode = YUKA.BVHNode;
const Vector3 = YUKA.Vector3;

const AABB = YUKA.AABB;
const MeshGeometry = YUKA.MeshGeometry;


describe( 'BVH', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const bvh = new BVH();

			expect( bvh ).to.have.a.property( 'branchingFactor' ).that.is.equal( 2 );
			expect( bvh ).to.have.a.property( 'primitivesPerNode' ).that.is.equal( 1 );
			expect( bvh ).to.have.a.property( 'depth' ).that.is.equal( 10 );
			expect( bvh ).to.have.a.property( 'root' ).that.is.null;

		} );

		it( 'should create an object with properties according to the given values', function () {

			const bvh = new BVH( 4, 2, 20 );
			expect( bvh.branchingFactor ).to.equal( 4 );
			expect( bvh.primitivesPerNode ).to.equal( 2 );
			expect( bvh.depth ).to.equal( 20 );

		} );

	} );

	describe( '#traverse()', function () {

		it( 'should traverse through the entire hierarchy of the BVH', function () {

			const bvh = new BVH();
			const vertices = new Float32Array( [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
			] );

			const geometry = new MeshGeometry( vertices );

			bvh.fromMeshGeometry( geometry );

			let nodeCount = 0;

			bvh.traverse( ( /* node */ ) => {

				nodeCount ++;

			} );

			expect( nodeCount ).to.equal( 3 );

		} );

	} );

} );

describe( 'BVHNode', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const node = new BVHNode();

			expect( node ).to.have.a.property( 'parent' ).that.is.null;
			expect( node ).to.have.a.property( 'children' ).that.is.an( 'array' );
			expect( node ).to.have.a.property( 'boundingVolume' ).that.is.an.instanceof( AABB );
			expect( node ).to.have.a.property( 'primitives' ).that.is.an( 'array' );
			expect( node ).to.have.a.property( 'centroids' ).that.is.an( 'array' );


		} );

	} );

	describe( '#root', function () {

		it( 'should return true if the this node is a root node', function () {

			const node1 = new BVHNode();
			const node2 = new BVHNode();

			node1.children.push( node2 );
			node2.parent = node1;

			expect( node1.root() ).to.be.true;
			expect( node2.root() ).to.be.false;

		} );

	} );

	describe( '#leaf', function () {

		it( 'should return true if the this node is a leaf node', function () {

			const node1 = new BVHNode();
			const node2 = new BVHNode();

			node1.children.push( node2 );
			node2.parent = node1;

			expect( node1.leaf() ).to.be.false;
			expect( node2.leaf() ).to.be.true;

		} );

	} );

	describe( '#getDepth', function () {

		it( 'should return the hierarchical depth of this BVH node', function () {

			const node1 = new BVHNode();
			const node2 = new BVHNode();

			node1.children.push( node2 );
			node2.parent = node1;

			expect( node1.getDepth() ).to.be.equal( 0 );
			expect( node2.getDepth() ).to.be.equal( 1 );

		} );

	} );

	describe( '#traverse', function () {

		it( 'should return the hierarchical depth of this BVH node', function () {

			const node1 = new CustomBVHNode();
			const node2 = new CustomBVHNode();

			node1.children.push( node2 );
			node2.parent = node1;

			node1.traverse( node => {

				node.traverseExecuted = true;

			} );

			expect( node1.traverseExecuted ).to.be.true;
			expect( node2.traverseExecuted ).to.be.true;

		} );

	} );

	describe( '#computeBoundingVolume', function () {

		it( 'should compute the AABB for the this BVHNode', function () {

			const node = new BVHNode();

			node.primitives = [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
			];

			node.computeBoundingVolume();

			expect( node.boundingVolume.max ).to.deep.equal( new Vector3( 1, 0, 1 ) );
			expect( node.boundingVolume.min ).to.deep.equal( new Vector3( 0, 0, - 1 ) );

		} );

	} );

	describe( '#computeSplitAxis', function () {

		it( 'should return the x-axis for the next split', function () {

			const node = new BVHNode();

			node.centroids = [
				1, 0.5, 0.5,
				- 1, - 0.5, - 0.5
			];

			expect( node.computeSplitAxis() ).to.deep.equal( new Vector3( 1, 0, 0 ) );

		} );

		it( 'should return the y-axis for the next split', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 1, 0.5,
				- 0.5, - 1, - 0.5
			];

			expect( node.computeSplitAxis() ).to.deep.equal( new Vector3( 0, 1, 0 ) );

		} );

		it( 'should return the z-axis for the next split', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 0.5, 1,
				- 0.5, - 0.5, - 1
			];

			expect( node.computeSplitAxis() ).to.deep.equal( new Vector3( 0, 0, 1 ) );

		} );

	} );

	describe( '#build', function () {

		it( 'should compute the bounding volume of this node and perform a split if necessary', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 0, - 0.3333333333333333,
				0.5, 0, 0.3333333333333333
			];
			node.primitives = [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
			];

			node.build( 2, 1, 10, 0 );

			expect( node.children ).to.have.lengthOf( 2 );
			expect( node.children[ 0 ].primitives ).to.deep.equal( new Array( 0, 0, 0, 1, 0, 0, 0.5, 0, - 1 ) );
			expect( node.children[ 0 ].centroids ).to.deep.equal( new Array( 0.5, 0, - 0.3333333333333333 ) );
			expect( node.children[ 1 ].primitives ).to.deep.equal( new Array( 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ) );
			expect( node.children[ 1 ].centroids ).to.deep.equal( new Array( 0.5, 0, 0.3333333333333333 ) );

		} );

		it( 'should perform no split if the maximum depth has been reached', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 0, - 0.3333333333333333,
				0.5, 0, 0.3333333333333333
			];
			node.primitives = [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
			];

			node.build( 2, 1, 10, 11 );

			expect( node.children ).to.have.lengthOf( 0 );

		} );

		it( 'should perform no split if the new child nodes do not hold enough primitives', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 0, - 0.3333333333333333,
				0.5, 0, 0.3333333333333333
			];
			node.primitives = [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
			];

			node.build( 2, 2, 10, 0 );

			expect( node.children ).to.have.lengthOf( 0 );

		} );

	} );

	describe( '#split', function () {

		it( 'should split the primitives of a BVHNode along a split axis and distribute the data to two child nodes', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 0, - 0.3333333333333333,
				0.5, 0, 0.3333333333333333
			];
			node.primitives = [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
			];

			node.split( 2 );

			expect( node.children ).to.have.lengthOf( 2 );
			expect( node.children[ 0 ].primitives ).to.deep.equal( new Array( 0, 0, 0, 1, 0, 0, 0.5, 0, - 1 ) );
			expect( node.children[ 0 ].centroids ).to.deep.equal( new Array( 0.5, 0, - 0.3333333333333333 ) );
			expect( node.children[ 1 ].primitives ).to.deep.equal( new Array( 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ) );
			expect( node.children[ 1 ].centroids ).to.deep.equal( new Array( 0.5, 0, 0.3333333333333333 ) );

		} );

		it( 'should distribute the primitives evenly to the child nodes expect for the last one (who takes the remaining primitives)', function () {

			const node = new BVHNode();

			node.centroids = [
				0.5, 0, - 0.3333333333333333,
				0.5, 0, 0.3333333333333333,
				1.5, 0, - 0.3333333333333333
			];
			node.primitives = [
				0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0,
				1, 0, 0, 	2, 0, 0, 	1.5, 0, - 1
			];

			node.split( 2 );

			expect( node.children ).to.have.lengthOf( 2 );
			expect( node.children[ 0 ].primitives ).to.have.lengthOf( 9 );
			expect( node.children[ 1 ].primitives ).to.have.lengthOf( 18 );

		} );

	} );

} );

//

class CustomBVHNode extends BVHNode {

	constructor() {

		super();

		this.traverseExecuted = false;

	}

}
