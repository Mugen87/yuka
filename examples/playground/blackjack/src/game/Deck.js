import Card from './Card.js';

/**
* Represents a deck of French-suited playing cards.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Deck {

	constructor() {

		this.cards = init();
		this.index = 0;

	}

	shuffle() {

		const cards = this.cards;

		for ( let i = cards.length - 1; i > 0; i -- ) {

			const newIndex = Math.floor( Math.random() * ( i + 1 ) );
			const oldValue = this.cards[ newIndex ];

			this.cards[ newIndex ] = this.cards[ i ];
			this.cards[ i ] = oldValue;

		}

		this.index = 0;

		return this;

	}

	nextCard() {

		const card = this.cards[ this.index ++ ];

		return card;

	}

}

const SUITS = [ '♣', '♠', '♥', '♦' ];
const TYPES = [ 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K' ];

function init() {

	// 4 (suits) * 13 (card types) * 6 (decks) = 312 cards

	const decks = [];

	for ( let i = 0; i < 6; i ++ ) {

		const deck = SUITS.flatMap( suit => {

			return TYPES.map( type => {

				return new Card( suit, type );

			} );

		} );

		decks.push( deck );

	}

	return decks.flat();

}

export default Deck;
