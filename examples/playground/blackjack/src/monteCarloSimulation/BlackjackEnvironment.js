import { MathUtils } from '../../../../../build/yuka.module.js';

/**
* Controls the flow of Blackjack games.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class BlackjackEnvironment {

	constructor( natural = false ) {

		this.actionSpace = [ ACTIONS.STICK, ACTIONS.HIT ];
		this.observationSpace = generateObservationSpace();

		this.player = null;
		this.dealer = null;

		this.natural = natural;

		this.reset();

	}

	reset() {

		this.player = drawHand();
		this.dealer = drawHand();

		return getState( this.player, this.dealer );

	}

	step( action ) {

		const player = this.player;
		const dealer = this.dealer;

		let done = false;
		let reward = 0;

		if ( this.actionSpace.includes( action ) === false ) throw new Error( 'Invalid Action' );

		if ( action === ACTIONS.HIT ) {

			// hit: add a card to players hand and return

			player.push( drawCard() );

			if ( isBust( player ) ) {

				done = true;
				reward = - 1;

			}

		} else {

			// stick: play out the dealers hand, and score

			done = true;

			while ( sumHand( this.dealer ) < 17 ) {

				this.dealer.push( drawCard() );

			}

			const scorePlayer = score( player );
			const scoreDealer = score( dealer );

			reward = compare( scorePlayer, scoreDealer );

			if ( this.natural && isNatural( player ) && reward === 1 ) {

				reward = 1.5;

			}

		}

		const state = getState( player, dealer );

		return { state, reward, done };

	}

}

// private

const deck = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10 ]; // 1 = ace, 2-10 = number cards, jack/queen/king = 10
const playerStates = [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 ]; // player sum
const dealerStates = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]; // dealer sum
const aceStates = [ 0, 1 ]; // unusable / usable

function compare( a, b ) {

	return Number( a > b ) - Number( a < b );

}

function drawCard() {

	const index = MathUtils.randInt( 0, deck.length - 1 );
	return deck[ index ];

}

function drawHand() {

	return [ drawCard(), drawCard() ];

}

function generateObservationSpace() {

	const space = [];

	for ( let i = 0; i < playerStates.length; i ++ ) {

		const playerState = playerStates[ i ];

		for ( let j = 0; j < dealerStates.length; j ++ ) {

			const dealerState = dealerStates[ j ];

			for ( let k = 0; k < aceStates.length; k ++ ) {

				const aceState = aceStates[ k ];

				space.push( playerState + '-' + dealerState + '-' + aceState );

			}

		}

	}

	return space;

}

function getState( player, dealer ) {

	return [ sumHand( player ), dealer[ 0 ], isUsableAce( player ) ];

}

function isBust( hand ) {

	return sumHand( hand ) > 21;

}

function isNatural( hand ) {

	return hand.includes( 1 ) && hand.includes( 10 );

}

function isUsableAce( hand ) {

	return hand.includes( 1 ) && sum( hand ) + 10 <= 21;

}

function score( hand ) {

	return isBust( hand ) ? 0 : sumHand( hand );

}

function sum( hand ) {

	return hand.reduce( ( a, c ) => a + c );

}

function sumHand( hand ) {

	const s = sum( hand );

	return isUsableAce( hand ) ? s + 10 : s;

}

const ACTIONS = Object.freeze( {
	STICK: 0,
	HIT: 1
} );

export { BlackjackEnvironment, ACTIONS };
