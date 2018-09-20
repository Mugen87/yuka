/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

import { Vector3 } from '../math/Vector3.js';

class Smoother {

	constructor( count = 10 ) {

		this.count = count; // how many samples the smoother will use to average a value
		this._history = []; // this holds the history
		this._slot = 0; // the current sample slot

		// initialize history with Vector3s

		for ( let i = 0; i < this.count; i ++ ) {

			this._history[ i ] = new Vector3();

		}

	}

	update( value, average ) {

		// ensure, average is a zero vector

		average.set( 0, 0, 0 );

		// make sure the slot index wraps around

		if ( this._slot === this.count ) {

			this._slot = 0;

		}

		// overwrite the oldest value with the newest

		this._history[ this._slot ].copy( value );

		// increase slot index

		this._slot ++;

		// now calculate the average of the history array

		for ( let i = 0; i < this.count; i ++ ) {

			average.add( this._history[ i ] );

		}

		average.divideScalar( this.count );

	}

}

export { Smoother };
