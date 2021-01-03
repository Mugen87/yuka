/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const GoalJSONs = require( '../../files/GoalJSONs.js' );

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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const brain = new Think( entity );
			const evaluator = new GoalEvaluator1( 0.5 );

			brain.addEvaluator( evaluator );

			const topLevelGoal = new CustomCompositeGoal( entity );
			const subgoal = new CustomGoal( entity );

			topLevelGoal.addSubgoal( subgoal );
			brain.addSubgoal( topLevelGoal );

			expect( brain.toJSON() ).to.be.deep.equal( GoalJSONs.Think );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entities = new Map();
			entities.set( '4C06581E-448A-4557-835E-7A9D2CE20D30', entity );

			const brain1 = new Think( entity );
			const evaluator = new GoalEvaluator( 0.5 );

			brain1.addEvaluator( evaluator );

			const topLevelGoal = new CustomCompositeGoal( entity );
			const subgoal = new CustomGoal( entity );

			topLevelGoal.addSubgoal( subgoal );
			brain1.addSubgoal( topLevelGoal );

			const brain2 = new Think();

			brain2.registerType( 'CustomCompositeGoal', CustomCompositeGoal );
			brain2.registerType( 'CustomGoal', CustomGoal );
			brain2.registerType( 'GoalEvaluator1', GoalEvaluator1 );

			brain2.fromJSON( GoalJSONs.Think );
			brain2.resolveReferences( entities );

			brain2._typesMap.clear(); // to enable deep equal test

			expect( brain1 ).to.be.deep.equal( brain2 );

		} );

		it( 'should log warnings if type definitions for custom evaluators and goals are missing', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			const brain = new Think();

			brain.fromJSON( GoalJSONs.ThinkMissingTypes );

			expect( brain.subgoals ).to.be.empty;
			expect( brain.evaluators ).to.be.empty;

		} );

	} );

	describe( '#registerType()', function () {

		it( 'should register a custom type for deserialization', function () {

			const brain = new Think();

			brain.registerType( 'CustomGoal', CustomGoal );

			expect( brain._typesMap.get( 'CustomGoal' ) ).to.equal( CustomGoal );

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

	setGoal( entity ) {

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

	setGoal( entity ) {

		entity.evaluator = this;

	}

}

class CustomCompositeGoal extends CompositeGoal {

	constructor( owner = null ) {

		super( owner );


	}

}

class CustomGoal extends Goal {

	constructor( owner = null ) {

		super( owner );


	}

}
