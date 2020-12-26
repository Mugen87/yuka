import { FuzzySet } from '../FuzzySet.js';

/**
* Class for representing a fuzzy set that has a normal distribution shape. It can be defined
* by the mean and standard deviation.
*
* @author {@link https://github.com/robp94|robp94}
* @augments FuzzySet
*/
class NormalDistFuzzySet extends FuzzySet {

	/**
	* Constructs a new triangular fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Mean or expectation of the normal distribution.
	* @param {Number} right - Represents the right border of this fuzzy set.
	* @param {Number} standardDeviation - Standard deviation of the normal distribution.
	*/
	constructor( left = 0, midpoint = 0, right = 0, standardDeviation = 0 ) {

		super( midpoint );

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = right;

		/**
		* Represents the standard deviation of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.standardDeviation = standardDeviation;

		//

		this._cache = {};

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		this._updateCache();

		if ( value >= this.right || value <= this.left ) return 0;

		return probabilityDensity( value, this.midpoint, this._cache.variance ) / this._cache.normalizationFactor;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;
		json.standardDeviation = this.standardDeviation;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {NormalDistFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;
		this.standardDeviation = json.standardDeviation;

		return this;

	}

	//

	_updateCache() {

		const cache =	this._cache;
		const midpoint = this.midpoint;
		const standardDeviation = this.standardDeviation;

		if ( midpoint !== cache.midpoint || standardDeviation !== cache.standardDeviation ) {

			const variance = standardDeviation * standardDeviation;

			cache.midpoint = midpoint;
			cache.standardDeviation = standardDeviation;
			cache.variance = variance;

			// this value is used to ensure the DOM lies in the range of [0,1]

			cache.normalizationFactor = probabilityDensity( midpoint, midpoint, variance );

		}

		return this;

	}

}

//

function probabilityDensity( x, mean, variance ) {

	return ( 1 / Math.sqrt( 2 * Math.PI * variance ) ) * Math.exp( - ( Math.pow( ( x - mean ), 2 ) ) / ( 2 * variance ) );

}

export { NormalDistFuzzySet };
