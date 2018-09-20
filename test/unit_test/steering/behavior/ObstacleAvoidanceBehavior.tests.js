/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const ObstacleAvoidanceBehavior = YUKA.ObstacleAvoidanceBehavior;
const GameEntity = YUKA.GameEntity;
const Vehicle = YUKA.Vehicle;
const Vector3 = YUKA.Vector3;

describe( 'ObstacleAvoidanceBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const obstacleAvoidanceBehavior = new ObstacleAvoidanceBehavior();
			expect( obstacleAvoidanceBehavior ).to.have.a.property( 'obstacles' ).that.is.an( 'array' );
			expect( obstacleAvoidanceBehavior ).to.have.a.property( 'brakingWeight' ).that.is.equal( 0.2 );
			expect( obstacleAvoidanceBehavior ).to.have.a.property( 'dBoxMinLength' ).that.is.equal( 4 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const obstacle = new GameEntity();
			const obstacleAvoidanceBehavior = new ObstacleAvoidanceBehavior( [ obstacle ] );
			expect( obstacleAvoidanceBehavior.obstacles ).to.include( obstacle );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should produce force that moves the vehicle away from an obstacle in range', function () {

			const vehicle = new Vehicle();
			vehicle.boundingRadius = 1;
			vehicle.velocity.set( 0, 0, 1 );

			const force = new Vector3();
			const obstacle1 = new GameEntity();
			obstacle1.boundingRadius = 1;
			obstacle1.position.set( 0, 0, 1 );

			const obstacle2 = new GameEntity();
			obstacle2.boundingRadius = 1;
			obstacle2.position.set( 0, 0, 2 );

			const obstacleAvoidanceBehavior = new ObstacleAvoidanceBehavior( [ obstacle1, obstacle2 ] );

			obstacleAvoidanceBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 1.75, y: 0, z: - 0.2 } );

		} );

		it( 'should produce no force if no obstacles are in range of the detection box', function () {

			const vehicle = new Vehicle();
			vehicle.boundingRadius = 1;
			vehicle.velocity.set( 0, 0, 1 );

			const force = new Vector3();
			const obstacle = new GameEntity();
			obstacle.position.set( 0, 0, 20 );
			obstacle.boundingRadius = 1;

			const obstacleAvoidanceBehavior = new ObstacleAvoidanceBehavior( [ obstacle ] );

			obstacleAvoidanceBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

		it( 'should produce no force if no obstacles are present', function () {

			const vehicle = new Vehicle();
			const force = new Vector3();

			const obstacleAvoidanceBehavior = new ObstacleAvoidanceBehavior();

			obstacleAvoidanceBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

} );
