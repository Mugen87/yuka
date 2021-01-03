/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


const OffsetPursuitBehavior = YUKA.OffsetPursuitBehavior;
const ArriveBehavior = YUKA.ArriveBehavior;
const Vehicle = YUKA.Vehicle;
const Vector3 = YUKA.Vector3;

describe( 'OffsetPursuitBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const pursuitBehavior = new OffsetPursuitBehavior();
			expect( pursuitBehavior ).to.have.a.property( 'leader' ).that.is.null;
			expect( pursuitBehavior ).to.have.a.property( 'offset' ).that.is.an.instanceof( Vector3 );
			expect( pursuitBehavior ).to.have.a.property( '_arrive' ).that.is.an.instanceof( ArriveBehavior );

		} );

		it( 'should apply the parameters to the new object', function () {

			const leader = new Vehicle();
			const offset = new Vector3();

			const pursuitBehavior = new OffsetPursuitBehavior( leader, offset );
			expect( pursuitBehavior.leader ).to.equal( leader );
			expect( pursuitBehavior.offset ).to.equal( offset );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should arrive at the defined offset from the leader', function () {

			const leader = new Vehicle();
			leader.position.set( 1, 1, 1 );

			const offset = new Vector3( 0, 0, 2 );
			const force = new Vector3();

			const vehicle = new Vehicle();
			vehicle.maxSpeed = 2;
			const offsetPursuitBehavior = new OffsetPursuitBehavior( leader, offset );

			offsetPursuitBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 0.6030226891555273, Number.EPSILON );
			expect( force.y ).to.closeTo( 0.6030226891555273, Number.EPSILON );
			expect( force.z ).to.closeTo( 1.8090680674665818, Number.EPSILON );

		} );

	} );
	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const offset = new Vector3( 0, 0, 1 );
			const offsetPursuitBehavior = new OffsetPursuitBehavior( null, offset );
			const json = offsetPursuitBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.OffsetPursuitBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const offset = new Vector3( 0, 0, 1 );
			const offsetPursuitBehavior1 = new OffsetPursuitBehavior( null, offset );
			const offsetPursuitBehavior2 = new OffsetPursuitBehavior().fromJSON( SteeringJSONs.OffsetPursuitBehavior );

			expect( offsetPursuitBehavior1 ).to.deep.equal( offsetPursuitBehavior2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new Vehicle();

			const behavior1 = new OffsetPursuitBehavior( entity1 );
			const behavior2 = new OffsetPursuitBehavior( );

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			behavior2.leader = entity1.uuid;

			const map = new Map();
			map.set( entity1.uuid, entity1 );

			behavior2.resolveReferences( map );

			expect( behavior2 ).to.deep.equal( behavior1 );

		} );

		it( 'should set the leader to null if the mapping is missing', function () {

			const behavior = new OffsetPursuitBehavior();
			behavior.leader = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			behavior.resolveReferences( new Map() );

			expect( behavior.leader ).to.be.null;

		} );

	} );

} );
