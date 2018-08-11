/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Vehicle = YUKA.Vehicle;
const SteeringManager = YUKA.SteeringManager;

describe( 'Vehicle', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const vehicle = new Vehicle();
			expect( vehicle ).to.have.a.property( 'mass' ).that.is.equal( 1 );
			expect( vehicle ).to.have.a.property( 'maxForce' ).that.is.equal( 100 );
			expect( vehicle ).to.have.a.property( 'steering' ).that.is.an.instanceof( SteeringManager );

		} );

	} );

	describe( '#update()', function () {

		it( 'should calculate the new position based on the produced force', function () {

			const vehicle = new Vehicle();
			vehicle.steering = new SteeringManagerStubCommon( vehicle );

			vehicle.update( 1 );

			expect( vehicle.position ).to.deep.equal( { x: 0, y: 0, z: - 0.5 } );

		} );

		it( 'should respect the mass of the vehicle when calculating the new position', function () {

			const vehicle = new Vehicle();
			vehicle.mass = 2; // double mass should half acceleration
			vehicle.steering = new SteeringManagerStubCommon();

			vehicle.update( 1 );

			expect( vehicle.position ).to.deep.equal( { x: 0, y: 0, z: - 0.25 } );

		} );

		it( 'should clamp the velocity based on maxSpeed', function () {

			const vehicle = new Vehicle();
			vehicle.maxSpeed = 0.25;
			vehicle.steering = new SteeringManagerStubCommon();

			vehicle.update( 1 );

			expect( vehicle.position ).to.deep.equal( { x: 0, y: 0, z: - 0.25 } );

		} );

		it( 'should respect the given delta value when calculating the new position', function () {

			const vehicle = new Vehicle();
			vehicle.steering = new SteeringManagerStubCommon( vehicle );

			vehicle.update( 0.5 );

			expect( vehicle.position ).to.deep.equal( { x: 0, y: 0, z: - 0.125 } );

		} );

		it( 'should not change the rotation of the entity when updateOrientation is set to false', function () {

			const vehicle = new Vehicle();
			vehicle.updateOrientation = false;
			vehicle.steering = new SteeringManagerStubCommon( vehicle );

			vehicle.update( 1 );

			expect( vehicle.rotation ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

		it( 'should not change the rotation of the entity when velocity is close to zero', function () {

			const vehicle = new Vehicle();
			vehicle.steering = new SteeringManagerStubMinForce( vehicle );

			vehicle.update( 1 );

			expect( vehicle.rotation ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

	} );

} );

//

class SteeringManagerStubCommon {

	calculate( delta, force ) {

		force.set( 0, 0, - 0.5 );

	}

}

class SteeringManagerStubMinForce {

	calculate( delta, force ) {

		force.set( 0, 0, - Number.EPSILON );

	}

}
