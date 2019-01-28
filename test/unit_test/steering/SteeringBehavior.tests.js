/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const SteeringJSONs = require( '../../files/SteeringJSONs.js' );

const SteeringBehavior = YUKA.SteeringBehavior;

describe( 'SteeringBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const steeringBehavior = new SteeringBehavior();
			expect( steeringBehavior ).to.have.a.property( 'active' ).that.is.true;
			expect( steeringBehavior ).to.have.a.property( 'weight' ).that.is.equal( 1 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should exist', function () {

			const steeringBehavior = new SteeringBehavior();
			expect( steeringBehavior ).respondTo( 'calculate' );
			steeringBehavior.calculate();

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const steeringBehavior = new SteeringBehavior();
			const json = steeringBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.SteeringBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const steeringBehavior1 = new SteeringBehavior();
			const steeringBehavior2 = new SteeringBehavior().fromJSON( SteeringJSONs.SteeringBehavior );

			expect( steeringBehavior1 ).to.deep.equal( steeringBehavior2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should exist', function () {

			const steeringBehavior = new SteeringBehavior();
			expect( steeringBehavior ).respondTo( 'resolveReferences' );

			steeringBehavior.resolveReferences();

		} );

	} );

} );
