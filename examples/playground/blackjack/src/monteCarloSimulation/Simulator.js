import { MathUtils } from '../../../../../build/yuka.module.js';

/**
* Implementation of a Monte Carlo simulation for Blackjack.
*
* Used Algorithm: First-Visit Constant-α GLIE MC Control.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Simulator {

	constructor( env, episodes ) {

		this.env = env;
		this.episodes = episodes;

		this.alpha = 0.001; // constant-α / learning rate

		this.epsilon = 1;
		this.minEpsilon = 0.01;
		this.decay = 0.9999;

	}

	predict() {

		const env = this.env;

		const Q = {};

		init( Q, env );

		for ( let i = 0; i < this.episodes; i ++ ) {

			// The implementation starts with a large epsilon so action selection will focus on
			// exploration. By playing more episodes, the epsilon will decrease and the probability
			// of taking the best action will increase (focus on exploitation).

			this.epsilon = Math.max( this.epsilon * this.decay, this.minEpsilon );

			const episode = playEpisode( env, Q, this.epsilon );

			updateQ( env, episode, Q, this.alpha );

		}

		return getBestPolicy( Q );

	}

}

function getBestPolicy( Q ) {

	const policy = {};

	for ( const key in Q ) {

		const actionValues = Q[ key ];

		const bestAction = MathUtils.argmax( actionValues )[ 0 ];

		policy[ key ] = bestAction;

	}

	return policy;

}

function getKey( state ) {

	return state[ 0 ] + '-' + state[ 1 ] + '-' + Number( state[ 2 ] );

}

function getProbabilities( Q, state, epsilon, nA ) {

	const key = getKey( state );

	const actionValues = Q[ key ];

	const probabilities = actionValues.map( () => epsilon / nA );

	const bestAction = MathUtils.argmax( actionValues )[ 0 ];

	probabilities[ bestAction ] = 1 - epsilon + ( epsilon / nA );

	return probabilities;

}

function init( Q, env ) {

	const actionSpace = env.actionSpace;
	const observationSpace = env.observationSpace;

	// initialize all state-action pairs with 0

	for ( let i = 0; i < observationSpace.length; i ++ ) {

		const state = observationSpace[ i ];
		Q[ state ] = actionSpace.map( () => 0 );

	}

}

function playEpisode( env, Q, epsilon ) {

	const episode = [];
	const actionSpace = env.actionSpace;
	const nA = actionSpace.length;

	let currentState = env.reset();

	while ( true ) {

		// Notes about policies:
		//
		// 1. Action selection is based on ε-soft policies (meaning they select all actions in all states with nonzero probability).
		// 2. The policies are ε-greedy (meaning most of the time they choose an action that has maximal estimated action value,
		//    but with probability ε they instead select an action at random).

		const probabilities = getProbabilities( Q, currentState, epsilon, nA );
		const action = MathUtils.choice( actionSpace, probabilities );

		// When the action was sampled, interact with the environment and generate new state

		const { state, reward, done } = env.step( action );

		episode.push( { state: currentState, action, reward } );

		currentState = state;

		if ( done ) break;

	}

	return episode;

}

function updateQ( env, episode, Q, alpha ) {

	let G = 0;

	for ( let t = episode.length - 1; t >= 0; t -- ) {

		const { state, action, reward } = episode[ t ];

		const key = getKey( state );

		G += reward;

		Q[ key ][ action ] += alpha * ( G - Q[ key ][ action ] );

	}

}

export default Simulator;
