import { BlackjackEnvironment, ACTIONS } from '../monteCarloSimulation/BlackjackEnvironment.js';
import Simulator from '../monteCarloSimulation/Simulator.js';

import Player from './Player.js';

/**
* Representing the AI player.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class AI extends Player {

	constructor( dealer ) {

		super();

		this.dealer = dealer;

		const env = new BlackjackEnvironment();
		const episodes = 1000000;

		const mcs = new Simulator( env, episodes );

		this.policy = mcs.predict();

	}

	getAction() {

		const sum = this.getSum();

		if ( sum < 12 ) {

			return ACTIONS.HIT;

		} else {

			const usableAce = this.hasUsableAce();
			const sumDealer = this.dealer.getSum();

			const state = sum + '-' + ( sumDealer === 11 ? 1 : sumDealer ) + '-' + Number( usableAce );

			return this.policy[ state ];

		}


	}

}

export default AI;
