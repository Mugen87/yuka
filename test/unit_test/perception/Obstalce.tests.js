/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Obstacle = YUKA.Obstacle;
const MeshGeometry = YUKA.MeshGeometry;
const GameEntity = YUKA.GameEntity;
const Ray = YUKA.Ray;
const Vector3 = YUKA.Vector3;

describe( 'Obstacle', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const obstacle = new Obstacle();
			expect( obstacle ).to.have.a.property( 'geometry' ).that.is.an.instanceof( MeshGeometry );
			expect( obstacle ).to.be.an.instanceof( GameEntity );

		} );

		it( 'should apply the parameters to the new object', function () {

			const geometry = new MeshGeometry();
			const obstacle = new Obstacle( geometry );
			expect( obstacle.geometry ).to.equal( geometry );

		} );

	} );

	describe( '#intersectRay()', function () {

		it( 'should perform a ray-triangle intersection test with the given ray and the internal geometry and store the result in the given vector', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const indices = new Uint16Array( [ 0, 1, 2, 3, 4, 5 ] );

			const geometry = new MeshGeometry( vertices, indices );
			const obstacle = new Obstacle( geometry );
			const intersectionPoint = new Vector3();

			const ray = new Ray( new Vector3( 0.5, 1, 0.5 ), new Vector3( 0, - 1, 0 ) );

			const result = obstacle.intersectRay( ray, intersectionPoint );

			expect( result ).not.to.be.null;
			expect( intersectionPoint ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );

		} );

		it( 'should support non-indexed mesh geometries', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );

			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );
			const intersectionPoint = new Vector3();

			const ray = new Ray( new Vector3( 0.5, 1, 0.5 ), new Vector3( 0, - 1, 0 ) );

			const result = obstacle.intersectRay( ray, intersectionPoint );

			expect( result ).not.to.be.null;
			expect( intersectionPoint ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );

		} );

		it( 'should perform an early out if the ray does not intersect the bounding volumes of the obstacle', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );

			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );
			const intersectionPoint = new Vector3();

			const ray = new Ray( new Vector3( 0.5, 1, 0.5 ), new Vector3( 0, 1, 0 ) );

			expect( obstacle.intersectRay( ray, intersectionPoint ) ).to.be.null;

		} );

		it( 'should respect the transformation of the obstacle', function () {

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );

			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );
			obstacle.position.set( 0, 0, - 0.1 );
			obstacle.updateWorldMatrix();

			const ray = new Ray( new Vector3( 0.5, 5, 0.5 ), new Vector3( 0, - 1, 0 ) );
			const intersectionPoint = new Vector3();

			const result = obstacle.intersectRay( ray, intersectionPoint );

			expect( result ).not.to.be.null;
			expect( intersectionPoint ).to.deep.equal( { x: 0.5, y: 0, z: 0.5 } );

		} );

	} );

} );
