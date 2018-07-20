/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, StateMachine } from '../../lib/yuka.module.js';

import { GlobalState, EnterMineAndDigForGold, VisitBankAndDepositGold, GoHomeAndSleepTillRested, QuenchThirst } from '../states/MinerStates.js';

class Miner extends GameEntity {

	constructor() {

		super();

		this.location = 'shack';
		this.gold = 0; // how many gold the miner has in his pockets
		this.money = 0; // how many gold the miner has in its bank
		this.thirstLevel = 0; // the higher the value, the thirstier the miner
		this.fatigueLevel = 0; // the higher the value, the more tired the miner

		this.COMFORT_LEVEL = 5; // the amount of gold a miner must have before he feels comfortable
		this.MAX_GOLD = 3; // the amount of nuggets a miner can carry
		this.THIRST_THRESHOLD = 5; // above this value a miner is thirsty
		this.TIREDNESS_THRESHOLD = 5; // above this value a miner is sleepy

		//

		this.stateMachine = new StateMachine( this );

		this.stateMachine.add( 'GLOBAL_STATE', new GlobalState() );
		this.stateMachine.add( 'ENTER_MINE_AND_DIG_FOR_GOLD', new EnterMineAndDigForGold() );
		this.stateMachine.add( 'VISIT_BANK_AND_DEPOSIT_GOLD', new VisitBankAndDepositGold() );
		this.stateMachine.add( 'GO_HOME_AND_SLEEP_TILL_RESTED', new GoHomeAndSleepTillRested() );
		this.stateMachine.add( 'QUENCH_THIRST', new QuenchThirst() );

		this.stateMachine.currentState = this.stateMachine.get( 'GO_HOME_AND_SLEEP_TILL_RESTED' );
		this.stateMachine.globalState = this.stateMachine.get( 'GLOBAL_STATE' );

	}

	update() {

		this.stateMachine.update();

	}

	pocketsFull() {

		return this.gold >= this.MAX_GOLD;

	}

	fatigued() {

		return this.fatigueLevel >= this.TIREDNESS_THRESHOLD;

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
