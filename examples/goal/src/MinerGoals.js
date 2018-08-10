/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Goal } from '../../../../../build/yuka.module.js';

class EnterMineAndDigForGold extends Goal {

	constructor( owner ) {

		super( owner );

	}

	execute() {

		const miner = this.owner;

		if ( miner.location !== 'goldmine' ) {

			console.log( 'Miner: Going to the goldmine.' );

			miner.location = 'goldmine';

		}

		miner.gold ++;

		console.log( 'Miner: Picking up a nugget. In pocket: %i', miner.gold );

	}

}

class QuenchThirst extends Goal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		const miner = this.owner;

		if ( miner.location !== 'saloon' ) {

			console.log( 'Miner: Going to the saloon. Boy, i am thirsty! Thirst level: %i', miner.thirstLevel );

			miner.location = 'saloon';

		}

	}

	execute() {

		this.owner.buyAndDrinkAWhiskey();

		console.log( 'Miner: That is mighty fine sipping liquer.' );

		this.status = Goal.STATUS.COMPLETED;

	}

}

class VisitBankAndDepositGold extends Goal {

	constructor( owner ) {

		super( owner );

	}

	activate() {

		const miner = this.owner;

		if ( miner.location !== 'bank' ) {

			console.log( 'Miner: Going to the bank.' );

			miner.location = 'bank';

		}

	}

	execute() {

		const miner = this.owner;

		miner.depositGold();

		console.log( 'Miner: Depositing gold. Total savings now: %i.', miner.money );

		this.status = Goal.STATUS.COMPLETED;

	}

}


export {
	EnterMineAndDigForGold,
	QuenchThirst,
	VisitBankAndDepositGold
};
