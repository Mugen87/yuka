/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const Vehicle = YUKA.Vehicle;
const SteeringManager = YUKA.SteeringManager;
const Smoother = YUKA.Smoother;
const EvadeBehavior = YUKA.EvadeBehavior;

describe( 'Vehicle', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const vehicle = new Vehicle();
			expect( vehicle ).to.have.a.property( 'mass' ).that.is.equal( 1 );
			expect( vehicle ).to.have.a.property( 'maxForce' ).that.is.equal( 100 );
			expect( vehicle ).to.have.a.property( 'steering' ).that.is.an.instanceof( SteeringManager );
			expect( vehicle ).to.have.a.property( 'smoother' ).that.is.null;

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

		it( 'should use a smoothed velocity vector to adjust the orientation if a smoother is set', function () {

			const vehicle = new Vehicle();

			vehicle.steering = new SteeringManagerStubSmooth( vehicle );
			vehicle.smoother = new Smoother( 2 );

			vehicle.update( 1 );
			expect( vehicle.rotation ).to.deep.equal( { x: 0, y: 1, z: 0, w: 0 } );

			vehicle.update( 1 );
			expect( vehicle.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( vehicle.rotation.y ).to.closeTo( 0.9651052298741876, Number.EPSILON );
			expect( vehicle.rotation.z ).to.closeTo( 0.26186235939800817, Number.EPSILON );
			expect( vehicle.rotation.w ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const vehicle = new Vehicle();
			vehicle._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			expect( vehicle.toJSON() ).to.be.deep.equal( CoreJSONs.Vehicle );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const vehicle = new Vehicle();
			vehicle._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const vehicle2 = new Vehicle();
			vehicle2.mass = 0;
			vehicle2.maxForce = 0;
			vehicle2.steering = null;
			vehicle2.smoother = new Smoother();
			vehicle2.fromJSON( CoreJSONs.Vehicle );

			expect( vehicle2 ).to.be.deep.equal( vehicle );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const vehicle = new Vehicle();
			const vehicle2 = new Vehicle();
			const vehiclea = new Vehicle();

			//set ids
			vehicle._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			vehicle2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';
			vehiclea._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			vehicle.neighbors.push( vehicle2 );
			vehiclea.neighbors.push( vehicle2.uuid );

			const evade = new EvadeBehavior( vehicle2 );
			const evade2 = new EvadeBehavior( vehicle2.uuid );
			vehicle.steering.add( evade );
			vehiclea.steering.add( evade2 );
			const map = new Map();
			map.set( vehicle2.uuid, vehicle2 );

			vehiclea.resolveReferences( map );

			expect( vehiclea ).to.deep.equal( vehicle );

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

class SteeringManagerStubSmooth {

	constructor() {

		this.count = 0;

	}

	calculate( delta, force ) {

		force.set( 0, this.count, - 0.5 );

		this.count ++;

	}

}
