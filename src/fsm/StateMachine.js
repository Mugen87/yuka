/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class StateMachine {

	constructor ( owner ) {

		this.owner = owner; // a reference to the agent that owns this instance
		this.currentState = null; // the current state of the agent
		this.previousState = null; // a reference to the last state the agent was in
		this.globalState = null; // this state logic is called every time the FSM is updated

	}

	update () {

		if ( this.globalState !== null ) {

			this.globalState.execute( this.owner );

		}

		if ( this.currentState !== null ) {

			this.currentState.execute( this.owner );

		}

	}

	changeState ( newState ) {

		this.previousState = this.currentState;

		this.currentState.exit( this.owner );

		this.currentState = newState;

		this.currentState.enter( this.owner );

	}

	revertToPrevoiusState () {

		this.changeState( this.previousState );

	}

	inState ( state ) {

		return ( state === this.currentState );

	}

}

export { StateMachine };
