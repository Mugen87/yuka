/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class MinerGlobalState extends YUKA.State {

	execute( miner ) {

		miner.thirstLevel ++;

	}

}

/**
 * In this state the miner will walk to a goldmine and pick up a nugget
 * of gold. If the miner already has a nugget of gold he'll change state
 * to VisitBankAndDepositGold. If he gets thirsty he'll change state
 * to QuenchThirst.
 */

class EnterMineAndDigForGold extends YUKA.State {

	enter( miner ) {

		// if the miner is not already located at the gold mine, he must change location to the gold mine

		if ( miner.location !== 'goldmine' ) {

			console.log( 'Miner: Walking to the goldmine.' );

			miner.location = 'goldmine';

		}

	}

	execute( miner ) {

		// The miner digs for gold until he is carrying in excess of maxNuggets.
		// If he gets thirsty during his digging he stops work and changes state to go to the saloon for a whiskey.

		miner.gold ++;

		console.log( 'Miner: Picking up a nugget. In pocket: %i', miner.gold );

		// diggin' is hard work

		miner.fatigueLevel ++;

		// if enough gold mined, go and put it in the bank

		if ( miner.pocketsFull() === true ) {

			miner.stateMachine.changeTo( 'VISIT_BANK_AND_DEPOSIT_GOLD' );

		}

		// if the miner is thirsty, go and drink something

		if ( miner.thirsty() === true ) {

			miner.stateMachine.changeTo( 'QUENCH_THIRST' );

		}

	}

	exit( miner ) {

		console.log( 'Miner: Leaving the goldmine.' );


	}

	onMessage( miner, telegram ) {

		return false;

	}

}

/**
 * Entity will go to a bank and deposit any nuggets he is carrying. If the
 * miner is subsequently wealthy enough he'll walk home, otherwise he'll
 * keep going to get more gold.
 */

class VisitBankAndDepositGold extends YUKA.State {

	enter( miner ) {

		// on entry the miner makes sure he is located at the bank

		if ( miner.location !== 'bank' ) {

			console.log( 'Miner: Going to the bank.' );

			miner.location = 'bank';

		}

	}

	execute( miner ) {

		// deposit the gold

		miner.depositGold();

		console.log( 'Miner: Depositing gold. Total savings now: %i.', miner.money );

		// wealthy enough to have a well earned rest?

		if ( miner.enoughMoney() === true ) {

			console.log( 'Miner: WooHoo! Rich enough for now. Back home now.' );

			miner.stateMachine.changeTo( 'GO_HOME_AND_SLEEP_TILL_RESTED' );

		} else {

			// otherwise get more gold

			miner.stateMachine.changeTo( 'ENTER_MINE_AND_DIG_FOR_GOLD' );

		}

	}

	exit( miner ) {

		console.log( 'Miner: Leaving the bank.' );


	}

	onMessage( miner, telegram ) {

		return false;

	}

}

/**
 * Miner will go home and sleep until his fatigue is decreased sufficiently.
 */

class GoHomeAndSleepTillRested extends YUKA.State {

	enter( miner ) {

		if ( miner.location !== 'shack' ) {

			console.log( 'Miner: Walking home. Fatigue level: %i', miner.fatigueLevel );

			miner.location = 'shack';

			// let the wife know miner is home

			const wife = miner.manager.getEntityByName( 'wife' );

			miner.sendMessage( wife, 'Home' );

		}

	}

	execute( miner ) {

		// if miner is not fatigued start to dig for nuggets again

		if ( miner.fatigued() === false ) {

			console.log( 'Miner: All my fatigue has drained away. Time to find more gold!' );

			miner.stateMachine.changeTo( 'ENTER_MINE_AND_DIG_FOR_GOLD' );

		} else {

			// sleep

			miner.fatigueLevel --;

			console.log( 'Miner: ZZZZ.' );

		}


	}

	onMessage( miner, telegram ) {

		const message = telegram.message;

		switch ( message ) {

			case 'StewReady':
				console.log( 'Miner: Okay, honey. I am coming.' );
				miner.stateMachine.changeTo( 'EAT_STEW' );

				return true;

		}

		// send message to global message handler

		return false;

	}

}

/**
 * Miner changes location to the saloon and keeps buying Whiskey until
 * his thirst is quenched. When satisfied he returns to the goldmine
 * and resumes his quest for nuggets.
 */

class QuenchThirst extends YUKA.State {

	enter( miner ) {

		if ( miner.location !== 'saloon' ) {

			console.log( 'Miner: Boy, i am thirsty! Walking to the saloon. Thirst level: %i', miner.thirstLevel );

			miner.location = 'saloon';

		}

	}

	execute( miner ) {

		miner.buyAndDrinkAWhiskey();

		console.log( 'Miner: That is mighty fine sipping liquer.' );

		miner.stateMachine.changeTo( 'ENTER_MINE_AND_DIG_FOR_GOLD' );

	}

	exit( miner ) {

		console.log( 'Miner: Leaving the saloon, feeling good.' );

	}

	onMessage( miner, telegram ) {

		return false;

	}

}

/**
 * This is implemented as a state blip. The miner eats the stew,
 * gives Elsa some compliments and then returns to his previous state.
 */

class EatStew extends YUKA.State {

	enter( miner ) {

		console.log( 'Miner: Smells Reaaal goood Elsa!' );

	}

	execute( miner ) {

		miner.buyAndDrinkAWhiskey();

		console.log( 'Miner: Tastes real good too!' );

		miner.stateMachine.revert();

	}

	exit( miner ) {

		console.log( 'Miner: Thank you, Elsa. I better get back to whatever i was doing.' );

	}

	onMessage( miner, telegram ) {

		return false;

	}

}
