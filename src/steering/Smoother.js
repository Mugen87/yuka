import { Vector3 } from '../math/Vector3.js';

/**
* This class can be used to smooth the result of a vector calculation. One use case
* is the smoothing of the velocity vector of game entities in order to avoid a shaky
* movements due to conflicting forces.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @author {@link https://github.com/robp94|robp94}
*/
class Smoother {

	/**
	* Constructs a new smoother.
	*
	* @param {Number} count - The amount of samples the smoother will use to average a vector.
	*/
	constructor( count = 10 ) {

		/**
		* The amount of samples the smoother will use to average a vector.
		* @type {Number}
		* @default 10
		*/
		this.count = count;

		this._history = new Array(); // this holds the history
		this._slot = 0; // the current sample slot

		// initialize history with Vector3s

		for ( let i = 0; i < this.count; i ++ ) {

			this._history[ i ] = new Vector3();

		}

	}

	/**
	* Calculates for the given value a smooth average.
	*
	* @param {Vector3} value - The value to smooth.
	* @param {Vector3} average - The calculated average.
	* @return {Vector3} The calculated average.
	*/
	calculate( value, average ) {

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

		return average;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const data = {
			type: this.constructor.name,
			count: this.count,
			_history: new Array(),
			_slot: this._slot
		};

		// history

		const history = this._history;

		for ( let i = 0, l = history.length; i < l; i ++ ) {

			const value = history[ i ];
			data._history.push( value.toArray( new Array() ) );

		}

		return data;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {Smoother} A reference to this smoother.
	*/
	fromJSON( json ) {

		this.count = json.count;
		this._slot = json._slot;

		// history

		const historyJSON = json._history;
		this._history.length = 0;

		for ( let i = 0, l = historyJSON.length; i < l; i ++ ) {

			const valueJSON = historyJSON[ i ];
			this._history.push( new Vector3().fromArray( valueJSON ) );

		}


		return this;

	}

}

export { Smoother };
