/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const obstacleAvoidanceBehavior = new ObstacleAvoidanceBehavior();
			obstacleAvoidanceBehavior.brakingWeight = 1;
			obstacleAvoidanceBehavior.dBoxMinLength = 1;
			const json = obstacleAvoidanceBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.ObstacleAvoidanceBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const obstacleAvoidanceBehavior1 = new ObstacleAvoidanceBehavior();
			obstacleAvoidanceBehavior1.brakingWeight = 1;
			obstacleAvoidanceBehavior1.dBoxMinLength = 1;
			const obstacleAvoidanceBehavior2 = new ObstacleAvoidanceBehavior().fromJSON( SteeringJSONs.ObstacleAvoidanceBehavior );

			expect( obstacleAvoidanceBehavior1 ).to.deep.equal( obstacleAvoidanceBehavior2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new Vehicle();

			const behavior1 = new ObstacleAvoidanceBehavior( );
			const behavior2 = new ObstacleAvoidanceBehavior( );

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			behavior1.obstacles.push( entity1 );
			behavior2.obstacles.push( entity1.uuid );

			const map = new Map();
			map.set( entity1.uuid, entity1 );


			behavior2.resolveReferences( map );

			expect( behavior2 ).to.deep.equal( behavior1 );

		} );

	} );

} );
