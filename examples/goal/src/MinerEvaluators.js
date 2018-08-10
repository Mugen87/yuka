/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GoalEvaluator } from '../../../../../build/yuka.module.js';

import { EnterMineAndDigForGold, QuenchThirst, VisitBankAndDepositGold } from './MinerGoals.js';

class EnterMineAndDigForGoldEvaluator extends GoalEvaluator {

	calculateDesirability() {

		return 0.5;

	}

	setGoal( miner ) {

		const currentSubgoal = miner.brain.currentSubgoal();

		if ( ( currentSubgoal instanceof EnterMineAndDigForGold ) === false ) {

			miner.brain.addSubgoal( new EnterMineAndDigForGold( miner ) );

		}

	}

}

class QuenchThirstEvaluator extends GoalEvaluator {

	calculateDesirability( miner ) {

		return ( miner.thirsty() === true ) ? 1 : 0;

	}

	setGoal( miner ) {

		miner.brain.clearSubgoals();

		miner.brain.addSubgoal( new QuenchThirst( miner ) );

	}

}

class VisitBankAndDepositGoldEvaluator extends GoalEvaluator {

	calculateDesirability( miner ) {

		return ( miner.pocketsFull() === true ) ? 1 : 0;

	}

	setGoal( miner ) {

		miner.brain.clearSubgoals();

		miner.brain.addSubgoal( new VisitBankAndDepositGold( miner ) );

	}

}


export {
	EnterMineAndDigForGoldEvaluator,
	QuenchThirstEvaluator,
	VisitBankAndDepositGoldEvaluator
};
