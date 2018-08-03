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

	executeSubgoals() {

		const subgoals = this.subgoals;

		// remove all completed and failed goals from the back of the subgoal list

		for ( let i = subgoals.length - 1; i >= 0; i -- ) {

			const subgoal = subgoals[ i ];

			if ( subgoal.completed() === true || subgoal.failed() === true ) {

				subgoal.terminate();
				subgoals.pop();

			} else {

				break;

			}

		}

		// if any subgoals remain, process the one at the back of the list

		if ( subgoals.length > 0 ) {

			const subgoal = subgoals[ subgoals.length - 1 ];
			subgoal.execute();

			// if subgoal is completed but more subgoals are in the list, return 'active'
			// status in order to keep processing the list of subgoals

			if ( ( subgoal.status === Goal.STATUS.COMPLETED ) && ( subgoals.length > 1 ) ) {

				return Goal.STATUS.ACTIVE;

			} else {

				return subgoal.status;

			}


		} else {

			return Goal.STATUS.COMPLETED;

		}

	}

	// messaging

	handleMessage( telegram ) {

		return this.forwardMessage( telegram );

	}

	forwardMessage( telegram ) {

		const subgoals = this.subgoals;
		const length = subgoals.length;

		if ( length > 0 ) {

			const subgoal = subgoals[ length - 1 ]; // pick last goal
			subgoal.handleMessage( telegram );

		}

		return false;

	}

}


export { CompositeGoal };
