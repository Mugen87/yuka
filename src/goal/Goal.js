/**
* Base class for represeting a goal in context of Goal-driven agent design.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Goal {

	/**
	* Constructs a new goal.
	*
	* @param {GameEntity} owner - The owner of this goal.
	*/
	constructor( owner = null ) {

		/**
		* The owner of this goal.
		* @type GameEntity
		*/
		this.owner = owner;

		/**
		* The status of this goal.
		* @type Status
		* @default INACTIVE
		*/
		this.status = Goal.STATUS.INACTIVE;

	}

	/**
	* Executed when this goal is activated.
	*/
	activate() {}

	/**
	* Executed in each simulation step.
	*/
	execute() {}

	/**
	* Executed when this goal is satisfied.
	*/
	terminate() {}

	/**
	* Goals can handle messages. Many don't though, so this defines a default behavior
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage( /* telegram */ ) {

		return false;

	}

	/**
	* Returns true if the status of this goal is *ACTIVE*.
	*
	* @return {Boolean} Whether the goal is active or not.
	*/
	active() {

		return this.status === Goal.STATUS.ACTIVE;

	}

	/**
	* Returns true if the status of this goal is *INACTIVE*.
	*
	* @return {Boolean} Whether the goal is inactive or not.
	*/
	inactive() {

		return this.status === Goal.STATUS.INACTIVE;

	}

	/**
	* Returns true if the status of this goal is *COMPLETED*.
	*
	* @return {Boolean} Whether the goal is completed or not.
	*/
	completed() {

		return this.status === Goal.STATUS.COMPLETED;

	}

	/**
	* Returns true if the status of this goal is *FAILED*.
	*
	* @return {Boolean} Whether the goal is failed or not.
	*/
	failed() {

		return this.status === Goal.STATUS.FAILED;

	}

	/**
	* Ensures the goal is replanned if it has failed.
	*
	* @return {Goal} A reference to this goal.
	*/
	replanIfFailed() {

		if ( this.failed() === true ) {

			this.status = Goal.STATUS.INACTIVE;

		}

		return this;

	}

	/**
	* Ensures the goal is activated if it is inactive.
	*
	* @return {Goal} A reference to this goal.
	*/
	activateIfInactive() {

		if ( this.inactive() === true ) {

			this.activate();

			this.status = Goal.STATUS.ACTIVE;

		}

		return this;

	}

}

Goal.STATUS = Object.freeze( {
	ACTIVE: 'active', // the goal has been activated and will be processed each update step
	INACTIVE: 'inactive', // the goal is waiting to be activated
	COMPLETED: 'completed', // the goal has completed and will be removed on the next update
	FAILED: 'failed' // the goal has failed and will either replan or be removed on the next update
} );


export { Goal };
