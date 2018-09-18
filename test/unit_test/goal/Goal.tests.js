/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const GameEntity = YUKA.GameEntity;
const Goal = YUKA.Goal;
const STATUS = Goal.STATUS;

describe( 'Goal', function () {

	describe( '#STATUS()', function () {

		it( 'should have all status values', function () {

			expect( STATUS ).to.have.a.property( 'INACTIVE' );
			expect( STATUS ).to.have.a.property( 'ACTIVE' );
			expect( STATUS ).to.have.a.property( 'COMPLETED' );
			expect( STATUS ).to.have.a.property( 'FAILED' );

		} );

		it( 'should not allow to change the status values', function () {

			delete STATUS.INACTIVE;

			expect( STATUS ).to.have.a.property( 'INACTIVE' );

		} );

	} );

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const goal = new Goal();
			expect( goal ).to.have.a.property( 'owner' ).that.is.null;
			expect( goal ).to.have.a.property( 'status' ).that.is.equal( STATUS.INACTIVE );

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const goal = new Goal( entity );

			expect( goal.owner ).to.equal( entity );

		} );

	} );

	describe( '#addSubgoal()', function () {

		it( 'should exist', function () {

			const goal = new Goal();
			expect( goal ).respondTo( 'addSubgoal' );

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );
			goal.addSubgoal();

		} );

	} );

	describe( '#activate()', function () {

		it( 'should exist', function () {

			const goal = new Goal();
			expect( goal ).respondTo( 'activate' );
			goal.activate();

		} );

	} );

	describe( '#execute()', function () {

		it( 'should exist', function () {

			const goal = new Goal();
			expect( goal ).respondTo( 'execute' );
			goal.execute();

		} );

	} );

	describe( '#terminate()', function () {

		it( 'should exist', function () {

			const goal = new Goal();
			expect( goal ).respondTo( 'terminate' );
			goal.terminate();

		} );

	} );

	describe( '#handleMessage()', function () {

		it( 'should exist', function () {

			const goal = new Goal();
			expect( goal ).respondTo( 'handleMessage' );

		} );

		it( 'should return "false" to indicate no message handling', function () {

			const goal = new Goal();
			expect( goal.handleMessage() ).to.be.false;

		} );

	} );

	describe( '#active', function () {

		it( 'should return true if the status of the goal is "active"', function () {

			const goal = new Goal();

			expect( goal.active() ).to.be.false; // default is INACTIVE
			goal.status = STATUS.ACTIVE;
			expect( goal.active() ).to.be.true;

		} );

	} );

	describe( '#inactive', function () {

		it( 'should return true if the status of the goal is "inactive"', function () {

			const goal = new Goal();

			expect( goal.inactive() ).to.be.true; // default is INACTIVE
			goal.status = STATUS.ACTIVE;
			expect( goal.inactive() ).to.be.false;

		} );

	} );

	describe( '#completed', function () {

		it( 'should return true if the status of the goal is "completed"', function () {

			const goal = new Goal();

			expect( goal.completed() ).to.be.false; // default is INACTIVE
			goal.status = STATUS.COMPLETED;
			expect( goal.completed() ).to.be.true;

		} );

	} );

	describe( '#failed', function () {

		it( 'should return true if the status of the goal is "failed"', function () {

			const goal = new Goal();

			expect( goal.failed() ).to.be.false; // default is INACTIVE
			goal.status = STATUS.FAILED;
			expect( goal.failed() ).to.be.true;

		} );

	} );

	describe( '#replanIfFailed', function () {

		it( 'should set the status of a goal to "inactive" if the status is "failed"', function () {

			const goal = new Goal();

			goal.status = STATUS.FAILED;

			goal.replanIfFailed();

			expect( goal.inactive() ).to.be.true;

		} );

		it( 'should do nothing if the status is not "failed"', function () {

			const goal = new Goal();

			goal.status = STATUS.COMPLETED;

			goal.replanIfFailed();

			expect( goal.completed() ).to.be.true;

		} );

	} );

	describe( '#activateIfInactive', function () {

		it( 'should set the status of a goal to "active" and call activate() if the status is "inactive"', function () {

			const goal = new CustomGoal();

			goal.status = STATUS.INACTIVE;

			goal.activateIfInactive();

			expect( goal.activateCalled ).to.be.true;
			expect( goal.active() ).to.be.true;

		} );

		it( 'should do nothing if the status is not "inactive"', function () {

			const goal = new Goal();

			goal.status = STATUS.COMPLETED;

			goal.activateIfInactive();

			expect( goal.completed() ).to.be.true;

		} );

	} );

} );

//

class CustomGoal extends Goal {

	constructor() {

		super();

		this.activateCalled = false;

	}

	activate() {

		this.activateCalled = true;

	}

}
