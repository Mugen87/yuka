/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const MeshGeometry = YUKA.MeshGeometry;
const AABB = YUKA.AABB;
const BoundingSphere = YUKA.BoundingSphere;

describe( 'MeshGeometry', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const geometry = new MeshGeometry();

			expect( geometry ).to.have.a.property( 'vertices' ).that.is.an.instanceof( Float32Array );
			expect( geometry ).to.have.a.property( 'indices' ).that.is.null;
			expect( geometry ).to.have.a.property( 'backfaceCulling' ).that.be.true;
			expect( geometry ).to.have.a.property( 'aabb' ).that.is.an.instanceof( AABB );
			expect( geometry ).to.have.a.property( 'boundingSphere' ).that.is.an.instanceof( BoundingSphere );

		} );

		it( 'should apply the parameters to the new object', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );
			expect( geometry.vertices ).to.equal( vertices );
			expect( geometry.indices ).to.equal( indices );

		} );

	} );

	describe( '#computeBoundingVolume()', function () {

		it( 'should compute the bounding volume for this mesh geometry', function () {

			const geometry = new MeshGeometry();
			geometry.vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			geometry.indices = new Uint16Array( [ 0, 1, 2 ] );

			geometry.computeBoundingVolume();

			expect( geometry.aabb.min ).to.deep.equal( { x: 0, y: 0, z: 0 } );
			expect( geometry.aabb.max ).to.deep.equal( { x: 1, y: 0, z: 1 } );

			expect( geometry.boundingSphere.center ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );
			expect( geometry.boundingSphere.radius ).to.closeTo( 0.7071067811865476, Number.EPSILON );


		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );

			const json = geometry.toJSON();

			expect( json ).to.be.deep.equal( CoreJSONs.MeshGeometry );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const vertices = new Float32Array( [ 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2 ] );

			const geometry = new MeshGeometry( vertices, indices );

			const geometry2 = new MeshGeometry().fromJSON( CoreJSONs.MeshGeometry );

			expect( geometry2 ).to.be.deep.equal( geometry );

		} );

	} );

} );
