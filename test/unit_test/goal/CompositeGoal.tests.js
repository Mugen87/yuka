/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const GoalJSONs = require( '../../files/GoalJSONs.js' );

const GameEntity = YUKA.GameEntity;
const CompositeGoal = YUKA.CompositeGoal;
const Goal = YUKA.Goal;
const STATUS = Goal.STATUS;

describe( 'CompositeGoal', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const compositeGoal = new CompositeGoal();
			expect( compositeGoal ).to.have.a.property( 'owner' ).that.is.null;
			expect( compositeGoal ).to.have.a.property( 'status' ).that.is.equal( STATUS.INACTIVE );
			expect( compositeGoal ).to.have.a.property( 'subgoals' ).that.is.an( 'array' ).and.empty;

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const compositeGoal = new CompositeGoal( entity );

			expect( compositeGoal.owner ).to.equal( entity );

		} );

		it( 'should inherit from Goal', function () {

			const compositeGoal = new CompositeGoal();

			expect( compositeGoal ).is.an.instanceof( Goal );

		} );

	} );

	describe( '#addSubgoal()', function () {

		it( 'should add a subgoal to the internal array', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new Goal() );

			expect( compositeGoal.subgoals ).to.have.lengthOf( 1 );

		} );

	} );

	describe( '#removeSubgoal()', function () {

		it( 'should remove a subgoal from the internal array', function () {

			const compositeGoal = new CompositeGoal();
			const subgoal = new Goal();

			compositeGoal.addSubgoal( subgoal );
			compositeGoal.removeSubgoal( subgoal );

			expect( compositeGoal.subgoals ).to.be.empty;

		} );

	} );

	describe( '#clearSubgoals()', function () {

		it( 'should remove all subgoals from the internal array', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );

			compositeGoal.clearSubgoals();

			expect( compositeGoal.subgoals ).to.be.empty;

		} );

	} );

	describe( '#currentSubgoal()', function () {

		it( 'should return the last subgoal in the array', function () {

			const compositeGoal = new CompositeGoal();

			const subgoal = new Goal();

			compositeGoal.addSubgoal( subgoal );
			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );

			expect( compositeGoal.currentSubgoal() ).to.equal( subgoal );

		} );

		it( 'should return null if the are no subgoals', function () {

			const compositeGoal = new CompositeGoal();

			expect( compositeGoal.currentSubgoal() ).to.be.null;

		} );

	} );

	describe( '#hasSubgoals()', function () {

		it( 'should return true if there are subgoals', function () {

			const compositeGoal = new CompositeGoal();

			expect( compositeGoal.hasSubgoals() ).to.be.false;

			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );

			expect( compositeGoal.hasSubgoals() ).to.be.true;

		} );

	} );

	describe( '#executeSubgoals()', function () {

		it( 'should set the status of the current subgoal to "active" and call activate() if its status is "inactive"', function () {

			const compositeGoal = new CompositeGoal();
			const subgoal = new CustomGoalCompleted();

			compositeGoal.addSubgoal( subgoal );
			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );

			compositeGoal.executeSubgoals();

			expect( subgoal.activateCalled ).to.be.true;

		} );

		it( 'should call execute() of the current subgoal', function () {

			const compositeGoal = new CompositeGoal();
			const subgoal = new CustomGoalCompleted();

			compositeGoal.addSubgoal( subgoal );
			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );

			compositeGoal.executeSubgoals();

			expect( subgoal.executeCalled ).to.be.true;

		} );

		it( 'should remove goals from the internal array with status "completed" or "failed" and call terminate()', function () {

			const compositeGoal = new CompositeGoal();

			const goalCompleted = new CustomGoalCompleted();
			goalCompleted.status = STATUS.COMPLETED;

			const goalFailed = new CustomGoalFailed();
			goalFailed.status = STATUS.FAILED;

			compositeGoal.addSubgoal( goalCompleted );
			compositeGoal.addSubgoal( goalFailed );
			compositeGoal.addSubgoal( new Goal() );

			compositeGoal.executeSubgoals();

			expect( compositeGoal.subgoals ).to.have.lengthOf( 1 );
			expect( goalFailed.terminateCalled ).to.be.true;
			expect( goalCompleted.terminateCalled ).to.be.true;

		} );

		it( 'should terminate subgoals if a composite goal is terminated and removed from the internal array of subgoals', function () {

			const compositeGoal = new CompositeGoal();

			const complexGoal = new CompositeGoal();
			complexGoal.status = STATUS.COMPLETED;

			const goalCompleted = new CustomGoalCompleted();
			compositeGoal.status = STATUS.COMPLETED;

			compositeGoal.addSubgoal( complexGoal );
			complexGoal.addSubgoal( goalCompleted );

			compositeGoal.executeSubgoals();

			expect( compositeGoal.subgoals ).to.be.empty;
			expect( complexGoal.subgoals ).to.be.empty;
			expect( goalCompleted.terminateCalled ).to.be.true;

		} );

		it( 'should return "active" if the current subgoal was executed with status "completed" and if there are subgoals waiting for processing', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new CustomGoalCompleted() );
			compositeGoal.addSubgoal( new CustomGoalFailed() );
			compositeGoal.addSubgoal( new Goal() );

			expect( compositeGoal.executeSubgoals() ).to.equal( STATUS.ACTIVE );

		} );

		it( 'should return "failed" if the current subgoal was executed with status "failed"', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new CustomGoalFailed() );

			expect( compositeGoal.executeSubgoals() ).to.equal( STATUS.FAILED );

		} );

		it( 'should return "completed" if there are no subgoals waiting for processing', function () {

			const compositeGoal = new CompositeGoal();

			expect( compositeGoal.executeSubgoals() ).to.equal( STATUS.COMPLETED );

		} );

	} );

	describe( '#handleMessage()', function () {

		it( 'should forward the message to the current subgoal', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new CustomGoalCompleted() );
			expect( compositeGoal.handleMessage() ).to.be.true;

		} );

		it( 'should return false if there are no subgoals', function () {

			const compositeGoal = new CompositeGoal();
			expect( compositeGoal.handleMessage() ).to.be.false;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const compositeGoal = new CompositeGoal( owner );
			const subgoal = new CustomGoalCompleted( owner );
			subgoal.status = STATUS.COMPLETED;

			compositeGoal.addSubgoal( subgoal );

			expect( compositeGoal.toJSON() ).to.be.deep.equal( GoalJSONs.CompositeGoal );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the reference to the owner', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entities = new Map();
			entities.set( '4C06581E-448A-4557-835E-7A9D2CE20D30', owner );

			const compositeGoal = new CompositeGoal();
			compositeGoal.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			const subgoal = new CustomGoalCompleted();
			subgoal.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			subgoal.status = STATUS.COMPLETED;

			compositeGoal.addSubgoal( subgoal );

			compositeGoal.resolveReferences( entities );

			expect( compositeGoal.owner ).to.equal( owner );
			expect( subgoal.owner ).to.equal( owner );

		} );

	} );

} );

//

class CustomGoalCompleted extends Goal {

	constructor( owner = null ) {

		super( owner );

		this.activateCalled = false;
		this.executeCalled = false;
		this.terminateCalled = false;

	}

	activate() {

		this.activateCalled = true;

	}

	execute() {

		this.executeCalled = true;

		this.status = STATUS.COMPLETED;

	}

	terminate() {

		this.terminateCalled = true;

	}

	handleMessage() {

		return true; // message handled

	}

}

class CustomGoalFailed extends Goal {

	constructor( owner = null ) {

		super( owner );

		this.activateCalled = false;
		this.executeCalled = false;
		this.terminateCalled = false;

	}

	activate() {

		this.activateCalled = true;

	}

	execute() {

		this.executeCalled = true;

		this.status = STATUS.FAILED;

	}

	terminate() {

		this.terminateCalled = true;

	}

	handleMessage() {

		return true; // message handled

	}

}
