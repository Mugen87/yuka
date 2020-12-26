import { FuzzySet } from '../FuzzySet.js';

/**
* Class for representing a fuzzy set that has a s-shape membership function with
* values from highest to lowest.
*
* @author {@link https://github.com/robp94|robp94}
* @augments FuzzySet
*/
class LeftSCurveFuzzySet extends FuzzySet {

	/**
	* Constructs a new S-curve fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		// the representative value is the midpoint of the plateau of the shoulder

		const representativeValue = ( midpoint + left ) / 2;

		super( representativeValue );

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

	}

	/**
	* Computes the degree of membership for the given value.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( value ) {

		const midpoint = this.midpoint;
		const left = this.left;
		const right = this.right;

		// find DOM if the given value is left of the center or equal to the center

		if ( ( value >= left ) && ( value <= midpoint ) ) {

			return 1;

		}

		// find DOM if the given value is right of the midpoint

		if ( ( value > midpoint ) && ( value <= right ) ) {

			if ( value >= ( ( midpoint + right ) / 2 ) ) {

				return 2 * ( Math.pow( ( value - right ) / ( midpoint - right ), 2 ) );

			} else { //todo test

				return 1 - ( 2 * ( Math.pow( ( value - midpoint ) / ( midpoint - right ), 2 ) ) );

			}

		}

		// out of range

		return 0;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.midpoint = this.midpoint;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {LeftSCurveFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

export { LeftSCurveFuzzySet };
