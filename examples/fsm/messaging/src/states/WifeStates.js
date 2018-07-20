/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { State } from '../../lib/yuka.module.js';

class WifeGlobalState extends State {

	execute( wife ) {

		// 1 in 10 chance of needing the bathroom (provided she is not already in the bathroom)

		if ( Math.random() < 0.1 && wife.stateMachine.in( 'VISIT_BATHROOM' ) === false ) {

			wife.stateMachine.changeTo( 'VISIT_BATHROOM' );

		}

	}

	onMessage( wife, telegram ) {

		const message = telegram.message;

		switch ( message ) {

			case 'Home':

				console.log( 'Wife: Hi honey. Let me make you some of my fine country stew.' );

				wife.stateMachine.changeTo( 'COOK_STEW' );

				return true;

			default:

		}

		return false;

	}

}

class DoHouseWork extends State {

	enter( /* wife */ ) {

		console.log( 'Wife: Time to do some more housework!' );

	}

	execute( /* wife */ ) {

		console.log( 'Wife: Mopping the floor.' );

	}

	onMessage( /* wife, telegram */ ) {

		return false;

	}

}

class VisitBathroom extends State {

	enter( /* wife */ ) {

		console.log( 'Wife: Walking to the bathroom. Need to powder my pretty nose.' );

	}

	execute( wife ) {

		console.log( 'Wife: Ahhhhhh! Sweet relief!' );

		wife.stateMachine.revert();

	}

	exit( /* wife */ ) {

		console.log( 'Wife: Leaving the bathroom.' );

	}

	onMessage( /* wife, telegram */ ) {

		return false;

	}

}

class CookStew extends State {

	enter( wife ) {

		// if not already cooking put the stew in the oven

		if ( wife.cooking === false ) {

			console.log( 'Wife: Putting the stew in the oven.' );

			wife.cooking = true;

			// this will send a message to herself

			wife.sendMessage( wife, 'StewReady', 4000 );

		}

	}

	execute( /* wife */ ) {

		console.log( 'Wife: Make stew.' );

	}


	onMessage( wife, telegram ) {

		const message = telegram.message;

		switch ( message ) {

			case 'StewReady':

				console.log( 'Wife: StewReady! Lets eat.' );

				// let miner know the stew is ready

				wife.sendMessage( wife.miner, 'StewReady' );

				wife.cooking = false;

				wife.stateMachine.changeTo( 'DO_HOUSE_WORK' );

				return true;

		}

		return false;

	}

}

export {
	WifeGlobalState,
	DoHouseWork,
	VisitBathroom,
	CookStew
};
