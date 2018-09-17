/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const GameEntity = YUKA.GameEntity;
const Think = YUKA.Think;
const CompositeGoal = YUKA.CompositeGoal;
const GoalEvaluator = YUKA.GoalEvaluator;
const Goal = YUKA.Goal;
const STATUS = Goal.STATUS;

describe( 'Think', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const brain = new Think();
			expect( brain ).to.have.a.property( 'owner' ).that.is.null;
			expect( brain ).to.have.a.property( 'status' ).that.is.equal( STATUS.INACTIVE );
			expect( brain ).to.have.a.property( 'subgoals' ).that.is.an( 'array' ).and.empty;
			expect( brain ).to.have.a.property( 'evaluators' ).that.is.an( 'array' ).and.empty;

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const brain = new Think( entity );

			expect( brain.owner ).to.equal( entity );

		} );

		it( 'should inherit from CompositeGoal', function () {

			const brain = new Think();

			expect( brain ).is.an.instanceof( CompositeGoal );

		} );

	} );

	describe( '#activate()', function () {

		it( 'should call arbitrate()', function () {

			const brain = new CustomThink();

			brain.activate();

			expect( brain.arbitrateCalled ).to.be.true;

		} );

	} );

	describe( '#execute()', function () {

		it( 'should call executeSubgoals() and set the status to "inactive" if all subgoals were executed', function () {

			const brain = new Think();

			brain.execute();

			expect( brain.status ).to.equal( STATUS.INACTIVE );

		} );

	} );

	describe( '#terminate()', function () {

		it( 'should remove all subgoals via clearSubgoals()', function () {

			const brain = new Think();

			brain.addSubgoal( new Goal() );
			brain.addSubgoal( new Goal() );
			brain.addSubgoal( new Goal() );

			brain.terminate();

			expect( brain.subgoals ).to.be.empty;

		} );

	} );

	describe( '#addEvaluator()', function () {

		it( 'should add an evaluator to the internal array', function () {

			const brain = new Think();
			const evaluator = new GoalEvaluator();

			brain.addEvaluator( evaluator );

			expect( brain.evaluators ).to.include( evaluator );

		} );

	} );

	describe( '#removeEvaluator()', function () {

		it( 'should remove the given evaluator from the internal array', function () {

			const brain = new Think();

			const evaluator = new GoalEvaluator();

			brain.addEvaluator( evaluator );
			brain.removeEvaluator( evaluator );

			expect( brain.evaluators ).to.not.include( evaluator );

		} );

	} );

	describe( '#arbitrate()', function () {

		it( 'should pick the evaluator with the highest score and call its setGoal() method', function () {

			const entity = new GameEntity();
			const brain = new Think( entity );

			const evaluator1 = new GoalEvaluator1();
			const evaluator2 = new GoalEvaluator2();

			brain.addEvaluator( evaluator1 );
			brain.addEvaluator( evaluator2 );

			brain.arbitrate();

			expect( entity.evaluator ).to.equal( evaluator2 );

		} );

		it( 'should regard the characterBias of the evaluators', function () {

			const entity = new GameEntity();
			const brain = new Think( entity );

			const evaluator1 = new GoalEvaluator1( 1 );
			const evaluator2 = new GoalEvaluator2( 0.4 );

			brain.addEvaluator( evaluator1 );
			brain.addEvaluator( evaluator2 );

			brain.arbitrate();

			expect( entity.evaluator ).to.equal( evaluator1 );

		} );

	} );

} );

//

class CustomThink extends Think {

	constructor() {

		super();

		this.arbitrateCalled = false;

	}

	arbitrate() {

		this.arbitrateCalled = true;

	}

}

class GoalEvaluator1 extends GoalEvaluator {

	constructor( characterBias ) {

		super( characterBias );

	}

	calculateDesirability() {

		return 0.5;

	}

	setGoal( entity ) {

		entity.evaluator = this;

	}

}


class GoalEvaluator2 extends GoalEvaluator {

	constructor( characterBias ) {

		super( characterBias );

	}

	calculateDesirability() {

		return 1;

	}

	setGoal( entity ) {

		entity.evaluator = this;

	}

}
