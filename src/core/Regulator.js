/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Time } from './Time.js';

class Regulator {

	constructor( updateFrequency = 0 ) {

		this.updateFrequency = updateFrequency; // updates per second

		this._time = new Time();

		this._nextUpdateTime = 0;

	}

	ready() {

		this._time.update();

		if ( this._time.currentTime >= this._nextUpdateTime ) {

			this._nextUpdateTime = this._time.currentTime + ( 1000 / this.updateFrequency );

			return true;

		}

		return false;

	}

}

export { Regulator };
