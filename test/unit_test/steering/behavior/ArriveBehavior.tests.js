/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );



const ArriveBehavior = YUKA.ArriveBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'ArriveBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const arriveBehavior = new ArriveBehavior();
			expect( arriveBehavior ).to.have.a.property( 'target' ).that.is.an.instanceof( Vector3 );
			expect( arriveBehavior ).to.have.a.property( 'deceleration' ).that.is.equal( 3 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const target = new Vector3( 0, 0, 10 );
			const arriveBehavior = new ArriveBehavior( target, 1 );
			expect( arriveBehavior.target ).to.deep.equal( { x: 0, y: 0, z: 10 } );
			expect( arriveBehavior.deceleration ).to.deep.equal( 1 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should seek to the given target position', function () {

			const target = new Vector3( 0, 0, 10 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const arriveBehavior = new ArriveBehavior( target, 1 );

			arriveBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should respect the current velocity of the vehicle', function () {

			const target = new Vector3( 0, 0, 10 );
			const vehicle = new Vehicle();
			vehicle.velocity.set( 0, 1, 0 );
			const force = new Vector3();

			const arriveBehavior = new ArriveBehavior( target, 1 );

			arriveBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: - 1, z: 1 } );

		} );

		it( 'should use the maxSpeed property of the vehicle in order to calculate the desired velocity', function () {

			const target = new Vector3( 0, 0, 10 );
			const vehicle = new Vehicle();
			vehicle.maxSpeed = 2;
			const force = new Vector3();

			const arriveBehavior = new ArriveBehavior( target, 1 );

			arriveBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 2 } );

		} );

		it( 'should use the deceleration property to reduce the force when the vehicle gets close to the target', function () {

			const target = new Vector3( 0, 0, 1 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const arriveBehavior = new ArriveBehavior( target, 2 );

			arriveBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0.5 } );

		} );

		it( 'should use the deceleration property to stop the vehicle when it is inside the tolerance range', function () {

			const target = new Vector3( 0, 0, 1 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const arriveBehavior = new ArriveBehavior( target, 2, 1 );

			vehicle.velocity = new Vector3( 0, 0, 1 );
			arriveBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( new Vector3( 0, 0, - 1 ) );

		} );

		it( 'should produce no force if the distance between the vehicle and the target is zero', function () {

			const target = new Vector3( 0, 0, 0 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const arriveBehavior = new ArriveBehavior( target, 1 );

			arriveBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const arriveBehavior = new ArriveBehavior( new Vector3( 0, 0, 1 ), 2 );
			const json = arriveBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.ArriveBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const arriveBehavior1 = new ArriveBehavior( new Vector3( 0, 0, 1 ), 2 );
			const arriveBehavior2 = new ArriveBehavior().fromJSON( SteeringJSONs.ArriveBehavior );

			expect( arriveBehavior1 ).to.deep.equal( arriveBehavior2 );

		} );

	} );

} );
