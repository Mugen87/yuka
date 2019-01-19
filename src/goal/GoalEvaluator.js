/**
* Base class for representing a goal evaluator in context of Goal-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GoalEvaluator {

	/**
	* Constructs a new goal evaluator.
	*
	* @param {Number} characterBias - Can be used to adjust the preferences of agents.
	*/
	constructor( characterBias = 1 ) {

		/**
		* Can be used to adjust the preferences of agents. When the desirability score
		* for a goal has been evaluated, it is multiplied by this value.
		* @type Number
		* @default 1
		*/
		this.characterBias = characterBias;

	}

	/**
	* Calculates the desirability. It's a score between 0 and 1 representing the desirability
	* of a goal. This goal is considered as a top level strategy of the agent like *Explore* or
	* *AttackTarget*. Must be implemented by all concrete goal evaluators.
	*
	* @param {GameEntity} owner - The owner of this goal evaluator.
	* @return {Number} The desirability.
	*/
	calculateDesirability( /* owner */ ) {

		return 0;

	}

	/**
	* Executed if this goal evaluator produces the highest desirability. Must be implemented
	* by all concrete goal evaluators.
	*
	* @param {GameEntity} owner - The owner of this goal evaluator.
	*/
	setGoal( /* owner */ ) {}

}



export { GoalEvaluator };
