/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Goal } from './Goal.js';

class CompositeGoal extends Goal {

	constructor( owner = null ) {

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

		for ( let i = 0, l = subgoals.length; i < l; i ++ ) {

			const subgoal = subgoals[ i ];

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

		const subgoals = this.subgoals;

		// remove all completed and failed goals from the back of the subgoal list

		for ( let i = subgoals.length - 1; i >= 0; i -- ) {

			const subgoal = subgoals[ i ];

			if ( ( subgoal.completed() === true ) || ( subgoal.failed() === true ) ) {

				subgoal.terminate();
				subgoals.pop();

			} else {

				break;

			}

		}

		// if any subgoals remain, process the one at the back of the list

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			subgoal.activateIfInactive();

			subgoal.execute();

			// if subgoal is completed but more subgoals are in the list, return 'active'
			// status in order to keep processing the list of subgoals

			if ( ( subgoal.completed() === true ) && ( subgoals.length > 1 ) ) {

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

		const subgoal = this.currentSubgoal();

		if ( subgoal !== null ) {

			return subgoal.handleMessage( telegram );

		}

		return false;

	}

}


export { CompositeGoal };
