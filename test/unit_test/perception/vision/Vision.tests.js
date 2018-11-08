/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const Vision = YUKA.Vision;
const GameEntity = YUKA.GameEntity;
const Obstacle = YUKA.Obstacle;
const MeshGeometry = YUKA.MeshGeometry;
const Vector3 = YUKA.Vector3;

describe( 'Vision', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const vision = new Vision();
			expect( vision.owner ).to.be.null;
			expect( vision.obstacles ).to.be.an( 'array' ).with.lengthOf( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const vision = new Vision( entity );
			expect( vision.owner ).to.equal( entity );

		} );

	} );

	describe( '#addObstacle()', function () {

		it( 'should add an obstacle to this vision instance', function () {

			const vision = new Vision();

			const obstacle = new Obstacle();
			vision.addObstacle( obstacle );

			expect( vision.obstacles ).to.include( obstacle );

		} );

	} );

	describe( '#removeObstacle()', function () {

		it( 'should remove an obstacle from this vision instance', function () {

			const vision = new Vision();

			const obstacle = new Obstacle();
			vision.addObstacle( obstacle );
			vision.removeObstacle( obstacle );

			expect( vision.obstacles ).to.not.include( obstacle );

		} );

	} );

	describe( '#visible()', function () {

		it( 'should return false if the given point lies outside the visual range of the game entity', function () {

			const entity = new GameEntity();
			entity.visualRange = 1;
			const vision = new Vision( entity );

			const point = new Vector3( 0, 0, 2 );

			expect( vision.visible( point ) ).to.be.false;

		} );

		it( 'should return false if the given point lies inside the visual range but outside the field of view of the game entity', function () {

			const entity = new GameEntity();
			entity.visualRange = 3;
			entity.fieldOfView = Math.PI * 0.25;
			const vision = new Vision( entity );

			const point = new Vector3( 0, 1, 2 );

			expect( vision.visible( point ) ).to.be.false;

		} );

		it( 'should return true if the given point lies inside the visual range and the field of view of the game entity', function () {

			const entity = new GameEntity();
			entity.visualRange = 3;
			entity.fieldOfView = Math.PI * 0.25;
			const vision = new Vision( entity );

			const point = new Vector3( 0, 0, 2 );

			expect( vision.visible( point ) ).to.be.true;

		} );

		it( 'should return false if the given point lies inside the visual range and the field of view of the game entity but an obstalce blocks the line of sight', function () {

			const entity = new GameEntity();
			entity.position.set( 0.5, 2, 0.5 );
			entity.visualRange = 3;
			entity.fieldOfView = Math.PI * 0.25;
			const vision = new Vision( entity );

			const vertices = new Float32Array( [ 1, 0, 0, 0.5, 0, 1, 1, 0, 1, 0, 0, 0, 0.5, 0, 1, 1, 0, 0 ] );
			const geometry = new MeshGeometry( vertices );
			const obstacle = new Obstacle( geometry );
			vision.addObstacle( obstacle );

			const point = new Vector3( 0.5, - 2, 0.5 );
			entity.lookAt( point );

			expect( vision.visible( point ) ).to.be.false;

		} );

	} );

} );
