/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class WifeGlobalState extends YUKA.State {

	execute( wife ) {

		// 1 in 10 chance of needing the bathroom (provided she is not already in the bathroom)

		if ( Math.random() < 0.1 && wife.stateMachine.inState( WIFE_STATES.VISIT_BATHROOM ) === false ) {

			wife.stateMachine.changeState( WIFE_STATES.VISIT_BATHROOM );

		}

	}

	onMessage( wife, telegram ) {

		const message = telegram.message;

		switch ( message ) {

			case 'Home':

				console.log( 'Wife: Hi honey. Let me make you some of my fine country stew.' );

				wife.stateMachine.changeState( WIFE_STATES.COOK_STEW );

				return true;

			default:

		}

		return false;

	}

}

class DoHouseWork extends YUKA.State {

	enter( wife ) {

		console.log( 'Wife: Time to do some more housework!' );

	}

	execute( wife ) {

		console.log( 'Wife: Mopping the floor.' );

	}

	onMessage( wife, telegram ) {

		return false;

	}

}

class VisitBathroom extends YUKA.State {

	enter( wife ) {

		console.log( 'Wife: Walking to the bathroom. Need to powder my pretty nose.' );

	}

	execute( wife ) {

		console.log( 'Wife: Ahhhhhh! Sweet relief!' );

		wife.stateMachine.revertToPrevoiusState();

	}

	exit( wife ) {

		console.log( 'Wife: Leaving the bathroom.' );

	}

	onMessage( wife, telegram ) {

		return false;

	}

}

class CookStew extends YUKA.State {

	enter( wife ) {

		// if not already cooking put the stew in the oven

		if ( wife.cooking === false ) {

			console.log( 'Wife: Putting the stew in the oven.' );

			wife.cooking = true;

			wife.sendMessage( wife, 'StewReady', 1500 );

		}

	}

	execute( wife ) {

		console.log( 'Wife: Make stew.' );

	}


	onMessage( wife, telegram ) {

		const message = telegram.message;

		switch ( message ) {

			case 'StewReady':

				console.log( 'Wife: StewReady! Lets eat.' );

				// let miner know the stew is ready

				wife.sendMessage( miner, 'StewReady' );

				wife.cooking = false;

				wife.stateMachine.changeState( WIFE_STATES.DO_HOUSE_WORK );

				return true;

		}

		return false;

	}

}

const WIFE_STATES = {
	GLOBAL_STATE: new WifeGlobalState(),
	DO_HOUSE_WORK: new DoHouseWork(),
	VISIT_BATHROOM: new VisitBathroom(),
	COOK_STEW: new CookStew()
};
