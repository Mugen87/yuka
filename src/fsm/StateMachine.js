/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { State } from './State.js';

class StateMachine {

	constructor( owner ) {

		this.owner = owner; // a reference to the agent that owns this instance
		this.currentState = null; // the current state of the agent
		this.previousState = null; // a reference to the last state the agent was in
		this.globalState = null; // this state logic is called every time the FSM is updated

	}

	update() {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

	}

	changeState( newState ) {

		if ( newState instanceof State ) {

			this.previousState = this.currentState;

			this.currentState.exit( this.owner );

			this.currentState = newState;

			this.currentState.enter( this.owner );

		} else {

			console.warn( 'YUKA.StateMachine: .changeState() needs a parameter of type "YUKA.State".' );

		}

	}

	revertToPrevoiusState() {

		this.changeState( this.previousState );

	}

	inState( state ) {

		return ( state === this.currentState );

	}

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

}

export { StateMachine };
