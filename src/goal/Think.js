import { Goal } from './Goal.js';
import { CompositeGoal } from './CompositeGoal.js';
import { Logger } from '../core/Logger.js';

/**
* Class for represeting the brain of a game entity.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments CompositeGoal
*/
class Think extends CompositeGoal {

	/**
	* Constructs a new *Think* object.
	*
	* @param {GameEntity} owner - The owner of this instance.
	*/
	constructor( owner = null ) {

		super( owner );

		/**
		* A list of goal evaluators.
		* @type Array
		*/
		this.evaluators = new Array();

	}

	/**
	* Executed when this goal is activated.
	*/
	activate() {

		this.arbitrate();

	}

	/**
	* Executed in each simulation step.
	*/
	execute() {

		this.activateIfInactive();

		const subgoalStatus = this.executeSubgoals();

		if ( subgoalStatus === Goal.STATUS.COMPLETED || subgoalStatus === Goal.STATUS.FAILED ) {

			this.status = Goal.STATUS.INACTIVE;

		}

	}

	/**
	* Executed when this goal is satisfied.
	*/
	terminate() {

		this.clearSubgoals();

	}

	/**
	* Adds the given goal evaluator to this instance.
	*
	* @param {GoalEvaluator} evaluator - The goal evaluator to add.
	* @return {Think} A reference to this instance.
	*/
	addEvaluator( evaluator ) {

		this.evaluators.push( evaluator );

		return this;

	}

	/**
	* Removes the given goal evaluator from this instance.
	*
	* @param {GoalEvaluator} evaluator - The goal evaluator to remove.
	* @return {Think} A reference to this instance.
	*/
	removeEvaluator( evaluator ) {

		const index = this.evaluators.indexOf( evaluator );
		this.evaluators.splice( index, 1 );

		return this;

	}

	/**
	* This method represents the top level decision process of an agent.
	* It iterates through each goal evaluator and selects the one that
	* has the highest score as the current goal.
	*
	* @return {Think} A reference to this instance.
	*/
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
