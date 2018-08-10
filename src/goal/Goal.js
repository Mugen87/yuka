/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Logger } from '../core/Logger.js';

class Goal {

	constructor( owner = null ) {

		this.owner = owner; // a reference to the agent that owns this instance
		this.status = Goal.STATUS.INACTIVE;

	}

	addSubgoal( /* goal */ ) {

		Logger.warn( 'YUKA.Goal: Unable to add goal to atomic goals.' );

	}

	//

	activate() {} // logic to run when the goal is activated

	execute() {} // logic to run each update step

	terminate() {} // logic to run when the goal is satisfied

	// goals can handle messages. Many don't though, so this defines a default behavior

	handleMessage( /* telegram */ ) {

		return false;

	}

	//

	active() {

		return this.status === Goal.STATUS.ACTIVE;

	}

	inactive() {

		return this.status === Goal.STATUS.INACTIVE;

	}

	completed() {

		return this.status === Goal.STATUS.COMPLETED;

	}

	failed() {

		return this.status === Goal.STATUS.FAILED;

	}

	//

	replanIfFailed() {

		if ( this.failed() === true ) {

			this.status = Goal.STATUS.INACTIVE;

		}

		return this;

	}

	activateIfInactive() {

		if ( this.inactive() === true ) {

			this.activate();

			this.status = Goal.STATUS.ACTIVE;

		}

		return this;

	}

}

Goal.STATUS = Object.freeze( {
	ACTIVE: 'active', // the goal has been activated and will be processed each update step
	INACTIVE: 'inactive', // the goal is waiting to be activated
	COMPLETED: 'completed', // the goal has completed and will be removed on the next update
	FAILED: 'failed' // the goal has failed and will either replan or be removed on the next update
} );


export { Goal };
