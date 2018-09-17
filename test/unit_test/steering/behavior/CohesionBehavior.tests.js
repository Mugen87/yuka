/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const CohesionBehavior = YUKA.CohesionBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'CohesionBehavior', function () {

	describe( '#calculate()', function () {

		it( 'should produce a force so the vehicle moves to the center of mass of its neighbors', function () {

			const vehicle = new Vehicle();
			const cohesionBehavior = new CohesionBehavior();
			const force = new Vector3();

			const neighbor1 = new Vehicle();
			const neighbor2 = new Vehicle();
			neighbor2.position.x = 1;

			vehicle.neighbors.push( neighbor1 );
			vehicle.neighbors.push( neighbor2 );

			cohesionBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 1, Number.EPSILON );
			expect( force.y ).to.closeTo( 0, Number.EPSILON );
			expect( force.z ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'should produce no force if the vehicle has no neighbors', function () {

			const vehicle = new Vehicle();
			const cohesionBehavior = new CohesionBehavior();
			const force = new Vector3();

			cohesionBehavior.calculate( vehicle, force );

			expect( force.length() ).to.equal( 0 );

		} );

	} );

} );
