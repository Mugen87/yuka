/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const WanderBehavior = YUKA.WanderBehavior;
const Vehicle = YUKA.Vehicle;
const Vector3 = YUKA.Vector3;

describe( 'WanderBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const wanderBehavior = new WanderBehavior();
			expect( wanderBehavior ).to.have.a.property( 'radius' ).that.is.equal( 1 );
			expect( wanderBehavior ).to.have.a.property( 'distance' ).that.is.equal( 5 );
			expect( wanderBehavior ).to.have.a.property( 'jitter' ).that.is.equal( 5 );
			expect( wanderBehavior ).to.have.a.property( '_targetLocal' ).that.is.an.instanceof( Vector3 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const wanderBehavior = new WanderBehavior( 2, 10, 10 );
			expect( wanderBehavior.radius ).to.equal( 2 );
			expect( wanderBehavior.distance ).to.equal( 10 );
			expect( wanderBehavior.jitter ).to.equal( 10 );


		} );

	} );

	describe( '#calculate()', function () {

		it( 'should produce a force so the agent wanders in 2D space', function () {

			const vehicle = new Vehicle();
			const force = new Vector3();
			const delta = 1;

			const wanderBehavior = new WanderBehavior();

			wanderBehavior.calculate( vehicle, force, delta );

			// not easy to test this method since a force is random
			// just ensure that the y component is zero

			expect( force.length() ).not.equal( 0 );
			expect( force.y ).to.equal( 0 );


		} );

	} );

} );
