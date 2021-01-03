/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const GoalJSONs = require( '../../files/GoalJSONs.js' );

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

		it( 'should set the status to "active" before activate() is called', function () {

			// this goal contains logic in its activate() method that will lead to a fail of the goal.
			// goals can already be completed, failed or even inactive after activate() was called

			const goal = new FailGoal();

			goal.activateIfInactive();

			expect( goal.failed() ).to.be.true;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const goal = new Goal( owner );
			goal.status = STATUS.COMPLETED;

			expect( goal.toJSON() ).to.be.deep.equal( GoalJSONs.Goal );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const goal1 = new Goal();

			goal1.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			goal1.status = STATUS.COMPLETED;

			const goal2 = new Goal().fromJSON( GoalJSONs.Goal );

			expect( goal1 ).to.be.deep.equal( goal2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the reference to the owner', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entities = new Map();
			entities.set( '4C06581E-448A-4557-835E-7A9D2CE20D30', owner );

			const goal = new Goal();
			goal.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			goal.resolveReferences( entities );

			expect( goal.owner ).to.equal( owner );

		} );

		it( 'should set the owner to null if the mapping is missing', function () {

			const goal = new Goal();
			goal.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			goal.resolveReferences( new Map() );

			expect( goal.owner ).to.be.null;

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

class FailGoal extends Goal {

	activate() {

		this.status = STATUS.FAILED;

	}

}
