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

		this._previousTime = 0;
		this._currentTime = 0;

		this._delta = 0;
		this._elapsed = 0;

		this._timescale = 1;

		this._useFixedDelta = false;
		this._fixedDelta = 16.67; // ms, corresponds to approx. 60 FPS

		// use Page Visibility API to avoid large time delta values

		this._usePageVisibilityAPI = ( typeof document !== 'undefined' && document.hidden !== undefined );

		if ( this._usePageVisibilityAPI === true ) {

			this._pageVisibilityHandler = handleVisibilityChange.bind( this );

			document.addEventListener( 'visibilitychange', this._pageVisibilityHandler, false );

		}

	}

	/**
	* Disables the usage of a fixed delta value.
	*
	* @return {Time} A reference to this time object.
	*/
	disableFixedDelta() {

		this._useFixedDelta = false;

		return this;

	}

	/**
	* Frees all internal resources.
	*
	* @return {Time} A reference to this time object.
	*/
	dispose() {

		if ( this._usePageVisibilityAPI === true ) {

			document.removeEventListener( 'visibilitychange', this._pageVisibilityHandler );

		}

		return this;

	}

	/**
	* Enables the usage of a fixed delta value. Can be useful for debugging and testing.
	*
	* @return {Time} A reference to this time object.
	*/
	enableFixedDelta() {

		this._useFixedDelta = true;

		return this;

	}

	/**
	* Returns the delta time in seconds. Represents the completion time in seconds since
	* the last simulation step.
	*
	* @return {Number} The delta time in seconds.
	*/
	getDelta() {

		return this._delta / 1000;

	}

	/**
	* Returns the elapsed time in seconds. It's the accumulated
	* value of all previous time deltas.
	*
	* @return {Number} The elapsed time in seconds.
	*/
	getElapsed() {

		return this._elapsed / 1000;

	}

	/**
	* Returns the fixed delta time in seconds.
	*
	* @return {Number} The fixed delta time in seconds.
	*/
	getFixedDelta() {

		return this._fixedDelta / 1000;

	}

	/**
	* Returns the timescale value.
	*
	* @return {Number} The timescale value.
	*/
	getTimescale() {

		return this._timescale;

	}

	/**
	* Resets this time object.
	*
	* @return {Time} A reference to this time object.
	*/
	reset() {

		this._currentTime = this._now();

		return this;

	}

	/**
	* Sets a fixed time delta value.
	*
	* @param {Number} fixedDelta - Fixed time delta in seconds.
	* @return {Time} A reference to this time object.
	*/
	setFixedDelta( fixedDelta ) {

		this._fixedDelta = fixedDelta * 1000;

		return this;

	}

	/**
	* Sets a timescale value. This value represents the scale at which time passes.
	* Can be used for slow down or  accelerate the simulation.
	*
	* @param {Number} timescale - The timescale value.
	* @return {Time} A reference to this time object.
	*/
	setTimescale( timescale ) {

		this._timescale = timescale;

		return this;

	}

	/**
	* Updates the internal state of this time object.
	*
	* @return {Time} A reference to this time object.
	*/
	update() {

		if ( this._useFixedDelta === true ) {

			this._delta = this._fixedDelta;

		} else {

			this._previousTime = this._currentTime;
			this._currentTime = this._now();

			this._delta = this._currentTime - this._previousTime;

		}

		this._delta *= this._timescale;

		this._elapsed += this._delta; // _elapsed is the accumulation of all previous deltas

		return this;

	}

	// private

	_now() {

		return ( typeof performance === 'undefined' ? Date : performance ).now();

	}

}

//

function handleVisibilityChange() {

	if ( document.hidden === false ) this.reset();

}

export { Time };
