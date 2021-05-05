import { State } from './State.js';
import { Logger } from '../core/Logger.js';

/**
* Finite state machine (FSM) for implementing State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class StateMachine {

	/**
	* Constructs a new state machine with the given values.
	*
	* @param {GameEntity} owner - The owner of this state machine.
	*/
	constructor( owner = null ) {

		/**
		* The game entity that owns this state machine.
		* @type {?GameEntity}
		* @default null
		*/
		this.owner = owner;

		/**
		* The current state of the game entity.
		* @type {?State}
		* @default null
		*/
		this.currentState = null;

		/**
		* The previous state of the game entity.
		* @type {?State}
		* @default null
		*/
		this.previousState = null; // a reference to the last state the agent was in

		/**
		* This state logic is called every time the state machine is updated.
		* @type {?State}
		* @default null
		*/
		this.globalState = null;

		/**
		* A map with all states of the state machine.
		* @type {Map<String,State>}
		*/
		this.states = new Map();

		//

		this._typesMap = new Map();

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
	* @param {String} id - The ID of the state.
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
	* @param {String} id - The ID of the state.
	* @return {StateMachine} A reference to this state machine.
	*/
	remove( id ) {

		this.states.delete( id );

		return this;

	}

	/**
	* Returns the state for the given ID.
	*
	* @param {String} id - The ID of the state.
	* @return {State} The state for the given ID.
	*/
	get( id ) {

		return this.states.get( id );

	}

	/**
	* Performs a state change to the state defined by its ID.
	*
	* @param {String} id - The ID of the state.
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
	* Returns true if this FSM is in the given state.
	*
	* @return {Boolean} Whether this FSM is in the given state or not.
	*/
	in( id ) {

		const state = this.get( id );

		return ( state === this.currentState );

	}

	/**
	* Tries to dispatch the massage to the current or global state and returns true
	* if the message was processed successfully.
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
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

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {
			owner: this.owner.uuid,
			currentState: null,
			previousState: null,
			globalState: null,
			states: new Array()
		};

		const statesMap = new Map();

		// states

		for ( let [ id, state ] of this.states ) {

			json.states.push( {
				type: state.constructor.name,
				id: id,
				state: state.toJSON()
			} );

			statesMap.set( state, id );

		}

		json.currentState = statesMap.get( this.currentState ) || null;
		json.previousState = statesMap.get( this.previousState ) || null;
		json.globalState = statesMap.get( this.globalState ) || null;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {StateMachine} A reference to this state machine.
	*/
	fromJSON( json ) {

		this.owner = json.owner;

		//

		const statesJSON = json.states;

		for ( let i = 0, l = statesJSON.length; i < l; i ++ ) {

			const stateJSON = statesJSON[ i ];
			const type = stateJSON.type;

			const ctor = this._typesMap.get( type );

			if ( ctor !== undefined ) {

				const id = stateJSON.id;
				const state = new ctor().fromJSON( stateJSON.state );

				this.add( id, state );

			} else {

				Logger.warn( 'YUKA.StateMachine: Unsupported state type:', type );
				continue;

			}

		}

		//

		this.currentState = ( json.currentState !== null ) ? ( this.get( json.currentState ) || null ) : null;
		this.previousState = ( json.previousState !== null ) ? ( this.get( json.previousState ) || null ) : null;
		this.globalState = ( json.globalState !== null ) ? ( this.get( json.globalState ) || null ) : null;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {StateMachine} A reference to this state machine.
	*/
	resolveReferences( entities ) {

		this.owner = entities.get( this.owner ) || null;

		for ( let state of this.states.values() ) {

			state.resolveReferences( entities );

		}

		return this;

	}

	/**
	* Registers a custom type for deserialization. When calling {@link StateMachine#fromJSON}
	* the state machine is able to pick the correct constructor in order to create custom states.
	*
	* @param {String} type - The name of the state type.
	* @param {Function} constructor - The constructor function.
	* @return {StateMachine} A reference to this state machine.
	*/
	registerType( type, constructor ) {

		this._typesMap.set( type, constructor );

		return this;

	}

	//

	_change( state ) {

		this.previousState = this.currentState;

		if ( this.currentState !== null ) {

			this.currentState.exit( this.owner );

		}

		this.currentState = state;

		this.currentState.enter( this.owner );

	}

}

export { StateMachine };
