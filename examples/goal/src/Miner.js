/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, Think } from '../../../../../build/yuka.module.js';

import { EnterMineAndDigForGoldEvaluator, QuenchThirstEvaluator, VisitBankAndDepositGoldEvaluator } from './MinerEvaluators.js';

class Miner extends GameEntity {

	constructor() {

		super();

		this.location = 'shack';
		this.gold = 0; // how many gold the miner has in his pockets
		this.money = 0; // how many gold the miner has in its bank
		this.thirstLevel = 0; // the higher the value, the thirstier the miner

		this.COMFORT_LEVEL = 5; // the amount of gold a miner must have before he feels comfortable
		this.MAX_GOLD = 3; // the amount of nuggets a miner can carry
		this.THIRST_THRESHOLD = 7; // above this value a miner is thirsty

		//

		this.brain = new Think( this );

		this.brain.addEvaluator( new EnterMineAndDigForGoldEvaluator() );
		this.brain.addEvaluator( new QuenchThirstEvaluator() );
		this.brain.addEvaluator( new VisitBankAndDepositGoldEvaluator() );

	}

	update() {

		this.thirstLevel ++;

		this.brain.execute();

		this.brain.arbitrate();

	}

	pocketsFull() {

		return this.gold >= this.MAX_GOLD;

	}

	thirsty() {

		return this.thirstLevel >= this.THIRST_THRESHOLD;

	}

	enoughMoney() {

		return this.money >= this.COMFORT_LEVEL;

	}

	buyAndDrinkAWhiskey() {

		this.thirstLevel = 0;
		this.money -= 2;

	}

	depositGold() {

		this.money += this.gold;
		this.gold = 0;

	}

}

export { Miner };
