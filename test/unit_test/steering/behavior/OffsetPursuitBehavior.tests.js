/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

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
			leader.updateMatrix();

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

} );
