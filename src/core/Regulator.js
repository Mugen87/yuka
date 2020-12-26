import { Time } from './Time.js';

/**
* Not all components of an AI system need to be updated in each simulation step.
* This class can be used to control the update process by defining how many updates
* should be executed per second.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Regulator {

	/**
	* Constructs a new regulator.
	*
	* @param {Number} updateFrequency - The amount of updates per second.
	*/
	constructor( updateFrequency = 0 ) {

		/**
		* The amount of updates per second.
		* @type {Number}
		* @default 0
		*/
		this.updateFrequency = updateFrequency;

		this._time = new Time();
		this._nextUpdateTime = 0;

	}

	/**
	* Returns true if it is time to allow the next update.
	*
	* @return {Boolean} Whether an update is allowed or not.
	*/
	ready() {

		this._time.update();

		const elapsedTime = this._time.getElapsed();

		if ( elapsedTime >= this._nextUpdateTime ) {

			this._nextUpdateTime = elapsedTime + ( 1 / this.updateFrequency );

			return true;

		}

		return false;

	}

}

export { Regulator };
