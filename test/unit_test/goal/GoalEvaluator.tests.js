/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const GoalJSONs = require( '../../files/GoalJSONs.js' );

const GoalEvaluator = YUKA.GoalEvaluator;

describe( 'GoalEvaluator', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const goalEvaluator = new GoalEvaluator();
			expect( goalEvaluator ).to.have.a.property( 'characterBias' ).that.is.equal( 1 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const goalEvaluator = new GoalEvaluator( 0.5 );

			expect( goalEvaluator.characterBias ).to.equal( 0.5 );

		} );

	} );

	describe( '#calculateDesirability()', function () {

		it( 'should exist', function () {

			const goalEvaluator = new GoalEvaluator();
			expect( goalEvaluator ).respondTo( 'calculateDesirability' );

		} );

		it( 'should return 0 as lowest desirability value', function () {

			const goalEvaluator = new GoalEvaluator();
			expect( goalEvaluator.calculateDesirability() ).to.equal( 0 );

		} );

	} );

	describe( '#setGoal()', function () {

		it( 'should exist', function () {

			const goalEvaluator = new GoalEvaluator();
			expect( goalEvaluator ).respondTo( 'setGoal' );
			goalEvaluator.setGoal();

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const goalEvaluator = new GoalEvaluator( 0.5 );

			expect( goalEvaluator.toJSON() ).to.be.deep.equal( GoalJSONs.GoalEvaluator );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const goalEvaluator1 = new GoalEvaluator( 0.5 );

			const goalEvaluator2 = new GoalEvaluator().fromJSON( GoalJSONs.GoalEvaluator );

			expect( goalEvaluator1 ).to.be.deep.equal( goalEvaluator2 );

		} );

	} );

} );
