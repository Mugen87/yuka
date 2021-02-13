import { ACTIONS } from './BlackjackEnvironment.js';

/**
* Implementation of a Monte Carlo simulation for Blackjack.
*
* Reference: Reinforcement Learning - An Introduction (Chapter 5.1 Monte Carlo Prediction)
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Simulator {

	constructor( env, episodes ) {

		this.env = env;
		this.episodes = episodes;

	}

	predict() {

		const env = this.env;

		const N = {}; // holds the amount of times a state/action pair has been visited
		const Q = {}; // the value of that state/action pair
		const R = {}; // the amount of returns that state/action pair has received

		init( N, Q, R, env );

		for ( let i = 0; i < this.episodes; i ++ ) {

			const episode = playEpisode( env );

			updateQ( N, Q, R, episode );

		}

		return Q;

	}

}

function init( N, Q, R, env ) {

	const actionSpace = env.actionSpace;
	const observationSpace = env.observationSpace;

	for ( let i = 0; i < observationSpace.length; i ++ ) {

		const state = observationSpace[ i ];

		for ( let i = 0; i < actionSpace.length; i ++ ) {

			const action = actionSpace[ i ];
			const key = state + '-' + action;

			N[ key ] = 0;
			Q[ key ] = 0;
			R[ key ] = 0;

		}

	}

}

function playEpisode( env ) {

	const episode = [];

	let currentState = env.reset();

	while ( true ) {

		// policy: if the player's hand is greater or equal 18, stick with a probability of 80% else hit with a probability of 80%
		// NOTE: (the code could approximate an optimal policy via MC Control)

		let action;

		if ( currentState[ 0 ] > 18 ) {

			action = Math.random() <= 0.8 ? ACTIONS.STICK : ACTIONS.HIT;

		} else {

			action = Math.random() <= 0.8 ? ACTIONS.HIT : ACTIONS.STICK;

		}

		const { state, reward, done } = env.step( action );

		episode.push( { state: currentState, action, reward } );

		currentState = state;

		if ( done ) break;

	}

	return episode;

}

function updateQ( N, Q, R, episode ) {

	let G = 0;

	for ( let t = episode.length - 1; t >= 0; t -- ) {

		const { state, action, reward } = episode[ t ];

		const key = state[ 0 ] + '-' + state[ 1 ] + '-' + Number( state[ 2 ] ) + '-' + action;

		G += reward;

		N[ key ] += 1;
		R[ key ] += G;
		Q[ key ] = R[ key ] / N[ key ];


	}

}

export default Simulator;
