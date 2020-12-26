/**
* This class is used for task management. Tasks are processed in an asynchronous
* way when there is idle time within a single simulation step or after a defined amount
* of time (deadline). The class is a wrapper around {@link https://w3.org/TR/requestidlecallback|requestidlecallback()},
* a JavaScript API for cooperative scheduling of background tasks.
*
* @author {@link https://github.com/robp94|robp94}
*/
class TaskQueue {

	/**
	* Constructs a new task queue.
	*/
	constructor() {

		/**
		* A list of pending tasks.
		* @type {Array<Task>}
		* @readonly
		*/
		this.tasks = new Array();

		/**
		* Used to control the asynchronous processing.
		* - timeout: After this amount of time (in ms), a scheduled task is executed even if
		* doing so risks causing a negative performance impact (e.g. bad frame time).
		* @type {Object}
		*/
		this.options = {
			timeout: 1000 // ms
		};

		//

		this._active = false;
		this._handler = runTaskQueue.bind( this );
		this._taskHandle = 0;

	}

	/**
	* Adds the given task to the task queue.
	*
	* @param {Task} task - The task to add.
	* @return {TaskQueue} A reference to this task queue.
	*/
	enqueue( task ) {

		this.tasks.push( task );

		return this;

	}

	/**
	* Updates the internal state of the task queue. Should be called
	* per simulation step.
	*
	* @return {TaskQueue} A reference to this task queue.
	*/
	update() {

		if ( this.tasks.length > 0 ) {

			if ( this._active === false ) {

				this._taskHandle = requestIdleCallback( this._handler, this.options );
				this._active = true;

			}

		} else {

			this._active = false;

		}

		return this;

	}

}

/**
* This function controls the processing of tasks. It schedules tasks when there
* is idle time at the end of a simulation step.
*
* @param {Object} deadline - This object contains a function which returns
* a number indicating how much time remains for task processing.
*/
function runTaskQueue( deadline ) {

	const tasks = this.tasks;

	while ( deadline.timeRemaining() > 0 && tasks.length > 0 ) {

		const task = tasks[ 0 ];

		task.execute();

		tasks.shift();

	}

	if ( tasks.length > 0 ) {

		this._taskHandle = requestIdleCallback( this._handler, this.options );
		this._active = true;

	} else {

		this._taskHandle = 0;
		this._active = false;

	}

}

export { TaskQueue };
