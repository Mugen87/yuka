/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


const AlignmentBehavior = YUKA.AlignmentBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'AlignmentBehavior', function () {

	describe( '#calculate()', function () {

		it( 'should produce a force so the vehicle heads towards the average heading of its neighbors', function () {

			const vehicle = new Vehicle();
			const alignmentBehavior = new AlignmentBehavior();
			const force = new Vector3();

			const neighbor1 = new Vehicle();
			const neighbor2 = new Vehicle();

			neighbor1.rotation.fromEuler( 0, 0.5 * Math.PI, 0 );
			neighbor2.rotation.fromEuler( 0, 0.5 * Math.PI, 0 );

			vehicle.neighbors.push( neighbor1 );
			vehicle.neighbors.push( neighbor2 );

			alignmentBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 1, Number.EPSILON );
			expect( force.y ).to.closeTo( 0, Number.EPSILON );
			expect( force.z ).to.closeTo( - 1, Number.EPSILON );

		} );

		it( 'should produce no force if the vehicle has no neighbors', function () {

			const vehicle = new Vehicle();
			const alignmentBehavior = new AlignmentBehavior();
			const force = new Vector3();

			alignmentBehavior.calculate( vehicle, force );

			expect( force.length() ).to.equal( 0 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const alignmentBehavior = new AlignmentBehavior();
			const json = alignmentBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.AlignmentBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const alignmentBehavior1 = new AlignmentBehavior();
			const alignmentBehavior2 = new AlignmentBehavior().fromJSON( SteeringJSONs.AlignmentBehavior );

			expect( alignmentBehavior1 ).to.deep.equal( alignmentBehavior2 );

		} );

	} );

} );
