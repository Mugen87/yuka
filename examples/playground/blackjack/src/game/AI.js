import { MathUtils } from '../../../../../build/yuka.module.js';

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

		const env = new BlackjackEnvironment( MathUtils );
		const episodes = 1000000;

		const mcs = new Simulator( env, episodes );

		this.q = mcs.predict();

	}

	getAction() {

		const sum = this.getSum();
		const usableAce = this.hasUsableAce();
		const sumDealer = this.dealer.getSum();

		const keyStick = sum + '-' + sumDealer + '-' + Number( usableAce ) + '-' + ACTIONS.STICK;
		const keyHit = sum + '-' + sumDealer + '-' + Number( usableAce ) + '-' + ACTIONS.HIT;

		const stickProb = this.q[ keyStick ];
		const hitProb = this.q[ keyHit ];

		return ( hitProb > stickProb ) ? ACTIONS.HIT : ACTIONS.STICK;

	}

}

export default AI;
