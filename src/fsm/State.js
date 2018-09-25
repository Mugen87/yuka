/**
* Base class for represeting a state in context of State-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class State {

	/**
	* This method is called once during a state transition when the {@link StateMachine} makes
	* this state active.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	enter( /* owner */ ) {}

	/**
	* This method is called per simulation step if this state is active.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	execute( /* owner */ ) {}

	/**
	* This method is called once during a state transition when the {@link StateMachine} makes
	* this state inactive.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	*/
	exit( /* owner */ ) {}

	/**
	* This method is called when messaging between game entities occurs.
	*
	* @param {GameEntity} owner - The game entity that represents the execution context of this state.
	* @param {Telegram} telegram - A data structure containing the actual message.
	* @return {Boolean} Whether the message was processed or not.
	*/
	onMessage( /* owner, telegram */ ) {

		return false;

	}

}

export { State };
