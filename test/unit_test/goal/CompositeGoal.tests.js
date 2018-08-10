/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

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

			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );
			const subgoal = new Goal();
			compositeGoal.addSubgoal( subgoal );

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

		it( 'should call execute() of the current subgoal', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );
			const subgoal = new CustomGoalCompleted();
			compositeGoal.addSubgoal( subgoal );

			compositeGoal.executeSubgoals();

			expect( subgoal.executeCalled ).to.be.true;

		} );

		it( 'should set the status of the current subgoal to "active" and call activate() if its status is "inactive"', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new Goal() );
			const subgoal = new CustomGoalCompleted();
			compositeGoal.addSubgoal( subgoal );

			compositeGoal.executeSubgoals();

			expect( subgoal.activateCalled ).to.be.true;

		} );

		it( 'should remove the current subgoal from the internal array and call terminate() if its status is "completed" or "failed"', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new Goal() );
			const subgoalFailed = new CustomGoalFailed();
			compositeGoal.addSubgoal( subgoalFailed );
			const subgoalCompleted = new CustomGoalCompleted();
			compositeGoal.addSubgoal( subgoalCompleted );

			compositeGoal.executeSubgoals();

			expect( subgoalCompleted.status ).to.equal( STATUS.COMPLETED );
			expect( subgoalCompleted.terminateCalled ).to.be.true;
			expect( compositeGoal.subgoals ).to.have.lengthOf( 2 );

			compositeGoal.executeSubgoals();

			expect( subgoalFailed.status ).to.equal( STATUS.FAILED );
			expect( subgoalFailed.terminateCalled ).to.be.true;
			expect( compositeGoal.subgoals ).to.have.lengthOf( 1 );

		} );

		it( 'should return "active" if the current subgoal was executed with status "completed" and if there are subgoals waiting for processing', function () {

			const compositeGoal = new CompositeGoal();

			compositeGoal.addSubgoal( new Goal() );
			compositeGoal.addSubgoal( new CustomGoalFailed() );
			compositeGoal.addSubgoal( new CustomGoalCompleted() );

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

} );

//

class CustomGoalCompleted extends Goal {

	constructor() {

		super();

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

	constructor() {

		super();

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
