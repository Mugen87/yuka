/**
* Base class for Blackjack players.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Player {

	constructor() {

		this.cards = [];

	}

	addCard( card ) {

		this.cards.push( card );

	}

	getCards() {

		return [ ...this.cards ];

	}

	getSum() {

		const cards = this.cards;

		let sum = 0;
		let hasAce = false;

		for ( const card of cards ) {

			sum += card.getValue();

			if ( card.isAce() ) hasAce = true;

		}

		const usableAce = hasAce && sum + 10 <= 21;

		return usableAce ? sum + 10 : sum;

	}

	hasUsableAce() {

		let hasAce = false;

		for ( const card of this.cards ) {

			if ( card.isAce() ) hasAce = true;

		}

		return hasAce && this.getSum() + 10 <= 21;

	}

	isBust() {

		return this.getSum() > 21;

	}

	reset() {

		this.cards.length = 0;

	}

}

export default Player;
