/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const SteeringBehavior = YUKA.SteeringBehavior;

describe( 'SteeringBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const steeringBehavior = new SteeringBehavior();
			expect( steeringBehavior ).to.have.a.property( 'active' ).that.is.true;
			expect( steeringBehavior ).to.have.a.property( 'weigth' ).that.is.equal( 1 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should exist', function () {

			const steeringBehavior = new SteeringBehavior();
			expect( steeringBehavior ).respondTo( 'calculate' );
			steeringBehavior.calculate();

		} );

	} );

} );
