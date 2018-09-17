/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Goal } from './Goal.js';
import { CompositeGoal } from './CompositeGoal.js';
import { Logger } from '../core/Logger.js';

class Think extends CompositeGoal {

	constructor( owner = null ) {

		super( owner );

		this.evaluators = new Array();

	}

	activate() {

		this.arbitrate();

	}

	execute() {

		this.activateIfInactive();

		const subgoalStatus = this.executeSubgoals();

		if ( subgoalStatus === Goal.STATUS.COMPLETED || subgoalStatus === Goal.STATUS.FAILED ) {

			this.status = Goal.STATUS.INACTIVE;

		}

	}

	terminate() {

		this.clearSubgoals();

	}

	addEvaluator( evaluator ) {

		this.evaluators.push( evaluator );

		return this;

	}

	removeEvaluator( evaluator ) {

		const index = this.evaluators.indexOf( evaluator );
		this.evaluators.splice( index, 1 );

		return this;

	}

	arbitrate() {

		const evaluators = this.evaluators;

		let bestDesirabilty = - 1;
		let bestEvaluator = null;

		// try to find the best top-level goal/strategy for the entity

		for ( let i = 0, l = evaluators.length; i < l; i ++ ) {

			const evaluator = evaluators[ i ];

			let desirabilty = evaluator.calculateDesirability( this.owner );
			desirabilty *= evaluator.characterBias;

			if ( desirabilty >= bestDesirabilty ) {

				bestDesirabilty = desirabilty;
				bestEvaluator = evaluator;

			}

		}

		// use the evaluator to set the respective goal

		if ( bestEvaluator !== null ) {

			bestEvaluator.setGoal( this.owner );

		} else {

			Logger.error( 'YUKA.Think: Unable to determine goal evaluator for game entity:', this.owner );

		}

		return this;

	}

}


export { Think };
