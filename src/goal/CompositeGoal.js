/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Goal } from './Goal.js';

class CompositeGoal extends Goal {

	constructor( owner ) {

		super( owner );

		this.subgoals = new Array(); // used as a stack (LIFO)

	}

	// subgoal related methods

	addSubgoal( goal ) {

		this.subgoals.push( goal );

		return this;

	}

	clearSubgoals() {

		const subgoals = this.subgoals;

		for ( let subgoal of subgoals ) {

			subgoal.terminate();

		}

		subgoals.length = 0;

		return this;

	}

	currentSubgoal() {

		const length = this.subgoals.length;

		if ( length > 0 ) {

			return this.subgoals[ length - 1 ];

		} else {

			return null;

		}

	}

	executeSubgoals() {

		// if any subgoals remain, process the one at the back of the list

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			subgoal.execute();

			if ( ( subgoal.completed() === true ) || ( subgoal.failed() === true ) ) {

				subgoal.terminate();
				this.subgoals.pop();

			}

			// if subgoal is completed but more subgoals are in the list, return 'active'
			// status in order to keep processing the list of subgoals

			if ( ( subgoal.completed() === true ) && ( this.hasSubgoals() === true ) ) {

				return Goal.STATUS.ACTIVE;

			} else {

				return subgoal.status;

			}

		} else {

			return Goal.STATUS.COMPLETED;

		}

	}

	hasSubgoals() {

		return this.subgoals.length > 0;

	}

	// messaging

	handleMessage( telegram ) {

		return this.forwardMessage( telegram );

	}

	forwardMessage( telegram ) {

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			subgoal.handleMessage( telegram );

		}

		return false;

	}

}


export { CompositeGoal };
