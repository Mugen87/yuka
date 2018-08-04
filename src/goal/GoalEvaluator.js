/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GoalEvaluator {

	constructor( characterBias = 1 ) {

		// when the desirability score for a goal has been evaluated, it is multiplied
		// by this value. It can be used to create bots with preferences based upon
		// their personality
		this.characterBias = characterBias;

	}

	calculateDesirability( /* entity */ ) {

		// returns a score between 0 and 1 representing the desirability of a goal

		return 0;

	}

	setGoal( /* entity */ ) {}

}



export { GoalEvaluator };
