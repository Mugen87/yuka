/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


const FleeBehavior = YUKA.FleeBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'FleeBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const fleeBehavior = new FleeBehavior();
			expect( fleeBehavior ).to.have.a.property( 'target' ).that.is.an.instanceof( Vector3 );
			expect( fleeBehavior ).to.have.a.property( 'panicDistance' ).that.is.equal( 10 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const target = new Vector3( 0, 0, 10 );
			const fleeBehavior = new FleeBehavior( target, 20 );
			expect( fleeBehavior.target ).to.deep.equal( { x: 0, y: 0, z: 10 } );
			expect( fleeBehavior.panicDistance ).to.equal( 20 );


		} );

	} );

	describe( '#calculate()', function () {

		it( 'should flee to the given target position', function () {

			const target = new Vector3( 0, 0, 1 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const fleeBehavior = new FleeBehavior( target );

			fleeBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: - 1 } );

		} );

		it( 'should respect the current velocity of the vehicle', function () {

			const target = new Vector3( 0, 0, 1 );
			const vehicle = new Vehicle();
			vehicle.velocity.set( 0, 1, - 1 );
			const force = new Vector3();

			const fleeBehavior = new FleeBehavior( target );

			fleeBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: - 1, z: 0 } );

		} );

		it( 'should use the maxSpeed property of the vehicle in order to calculate the desired velocity', function () {

			const target = new Vector3( 0, 0, 1 );
			const vehicle = new Vehicle();
			vehicle.maxSpeed = 2;
			const force = new Vector3();

			const fleeBehavior = new FleeBehavior( target );

			fleeBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: - 2 } );

		} );

		it( 'should not produce a force if the target is outside of the panic distance', function () {

			const target = new Vector3( 0, 0, 20 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const fleeBehavior = new FleeBehavior( target );

			fleeBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

		it( 'should produce a default velocity ( 0, 0, 1 ) if target and vehicle position are identical', function () {

			const target = new Vector3();
			const vehicle = new Vehicle();
			const force = new Vector3();

			const fleeBehavior = new FleeBehavior( target );

			fleeBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const fleeBehavior = new FleeBehavior( new Vector3( 0, 0, 1 ), 5 );
			const json = fleeBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.FleeBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const fleeBehavior1 = new FleeBehavior( new Vector3( 0, 0, 1 ), 5 );
			const fleeBehavior2 = new FleeBehavior().fromJSON( SteeringJSONs.FleeBehavior );

			expect( fleeBehavior2 ).to.deep.equal( fleeBehavior1 );

		} );

	} );

} );
