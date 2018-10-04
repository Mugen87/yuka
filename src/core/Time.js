/**
* Class for representing a timer.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Time {

	/**
	* Constructs a new time object.
	*/
	constructor() {

		/**
		* The start time of this timer.
		* @type Number
		* @default 0
		*/
		this.startTime = 0;

		/**
		* The time stamp of the last simulation step.
		* @type Number
		* @default 0
		*/
		this.previousTime = 0;

		/**
		* The time stamp of the current simulation step.
		* @type Number
		* @default 0
		*/
		this.currentTime = 0;

	}

	/**
	* Returns the delta time in seconds for the current simulation step.
	*
	* @return {Number} The delta time in seconds.
	*/
	getDelta() {

		return ( this.currentTime - this.previousTime ) / 1000;

	}

	/**
	* Returns the elapsed time in seconds of this timer.
	*
	* @return {Number} The elapsed time in seconds.
	*/
	getElapsed() {

		return ( this.currentTime - this.startTime ) / 1000;

	}

	/**
	* Updates the internal state of this timer.
	*
	* @return {Time} A reference to this timer.
	*/
	update() {

		this.previousTime = this.currentTime;
		this.currentTime = this.now();

		return this;

	}

	/**
	* Returns a current time value in milliseconds.
	*
	* @return {Number} A current time value in milliseconds.
	*/
	now() {

		return ( typeof performance === 'undefined' ? Date : performance ).now();

	}

}

export { Time };
