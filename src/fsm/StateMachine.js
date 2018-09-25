import { State } from './State.js';
import { Logger } from '../core/Logger.js';

/**
* Finite state machine (FSM) for implementing State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87 }
*/
class StateMachine {

	/**
	* Constructs a new state machine with the given values.
	*
	* @param {GameEntity} owner - The owner of this state machine.
	*/
	constructor( owner ) {

		/**
		* The game entity that owns this state machine.
		* @type GameEntity
		*/
		this.owner = owner;

		/**
		* The current state of the game entity.
		* @type State
		*/
		this.currentState = null;

		/**
		* The previous state of the game entity.
		* @type State
		*/
		this.previousState = null; // a reference to the last state the agent was in

		/**
		* This state logic is called every time the state machine is updated.
		* @type State
		*/
		this.globalState = null;

		/**
		* A map with all states of the state machine.
		* @type Map
		*/
		this.states = new Map();

	}

	/**
	* Updates the internal state of the FSM. Usually called by {@link GameEntity#update}.
	*
	* @return {StateMachine} A reference to this state machine.
	*/
	update() {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

		return this;

	}

	/**
	* Adds a new state with the given ID to the state machine.
	*
	* @param {string} id - The ID of the state.
	* @param {State} state - The state.
	* @return {StateMachine} A reference to this state machine.
	*/
	add( id, state ) {

		if ( state instanceof State ) {

			this.states.set( id, state );

		} else {

			Logger.warn( 'YUKA.StateMachine: .add() needs a parameter of type "YUKA.State".' );

		}

		return this;

	}

	/**
	* Removes a state via its ID from the state machine.
	*
	* @param {string} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	remove( id ) {

		this.states.delete( id );

		return this;

	}

	/**
	* Returns the state for the given ID.
	*
	* @param {string} id - The ID of the state.
	* @return {State} The state for the given ID.
	*/
	get( id ) {

		return this.states.get( id );

	}

	/**
	* Performs a state change to the state defined by its ID.
	*
	* @param {string} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	changeTo( id ) {

		const state = this.get( id );

		this._change( state );

		return this;

	}

	/**
	* Returns to the previous state.
	*
	* @return {StateMachine} A reference to this state machine.
	*/
	revert() {

		this._change( this.previousState );

		return this;

	}

	/**
	* Returns true if the state machine is in the given state.
	*
	* @return {Boolean} The result of the test.
	*/
	in( id ) {

		const state = this.get( id );

		return ( state === this.currentState );

	}

	/**
	* Tries to dispatch the massage to the current or global state and returns true
	* if the message was processed successfully.
	*
	* @return {Boolean} The result of the message handling.
	*/
	handleMessage( telegram ) {

		// first see, if the current state is valid and that it can handle the message

		if ( this.currentState !== null && this.currentState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		// if not, and if a global state has been implemented, send the message to the global state

		if ( this.globalState !== null && this.globalState.onMessage( this.owner, telegram ) === true ) {

			return true;

		}

		return false;

	}

	_change( state ) {

		this.previousState = this.currentState;

		this.currentState.exit( this.owner );

		this.currentState = state;

		this.currentState.enter( this.owner );

	}

}

export { StateMachine };
