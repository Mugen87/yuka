/**
* Implementation of a Monte Carlo simulation for Blackjack.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Simulator {

	constructor( env, episodes ) {

		this.env = env;
		this.episodes = episodes;

		this.alpha = 0.001;

		this.minEpsilon = 0.01;
		this.decay = 0.9999;

		this.epsilon = 1;

	}

	predict() {

		const env = this.env;

		const Q = {};

		init( Q, env );

		for ( let i = 0; i < this.episodes; i ++ ) {

			this.epsilon = Math.max( this.epsilon * this.decay, this.minEpsilon );

			const episode = playEpisode( env, Q, this.epsilon );

			updateQ( env, episode, Q, this.alpha );

		}

		return Q;

	}

}

function getKey( state ) {

	return state[ 0 ] + '-' + state[ 1 ] + '-' + Number( state[ 2 ] );

}

function getProbabilities( Q, state, epsilon, nA ) {

	const key = getKey( state );

	const actionValues = Q[ key ];

	const probabilities = actionValues.map( () => epsilon / nA );

	const bestAction = actionValues.indexOf( Math.max( ...actionValues ) );

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
	const nA = env.actionSpace.length;

	let currentState = env.reset();

	while ( true ) {

		const probabilities = getProbabilities( Q, currentState, epsilon, nA );

		const action = env.sampleAction( probabilities );

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

		Q[ key ][ action ] = Q[ key ][ action ] + alpha * ( G - Q[ key ][ action ] );

	}

}

export default Simulator;
