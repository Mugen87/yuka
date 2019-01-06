import { FuzzySet } from '../FuzzySet.js';

/**
* Class for representing a fuzzy set that has a right shoulder shape. The range between
* the midpoint and right border point represents the same DOM.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class RightShoulderFuzzySet extends FuzzySet {

	/**
	* Constructs a new right shoulder fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		// the representative value is the midpoint of the plateau of the shoulder

		const representativeValue = ( midpoint + right ) / 2;

		super( representativeValue );

		/**
		* Represents the left border of this fuzzy set.
		* @type Number
		* @default 0
		*/
		this.left = left;

		/**
		* Represents the peak value of this fuzzy set.
		* @type Number
		* @default 0
		*/
		this.midpoint = midpoint;

		/**
		* Represents the right border of this fuzzy set.
		* @type Number
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

			const grad = 1 / ( midpoint - left );

			return grad * ( value - left );

		}

		// find DOM if the given value is right of the midpoint

		if ( ( value > midpoint ) && ( value <= right ) ) {

			return 1;

		}

		// out of range

		return 0;

	}

}

export { RightShoulderFuzzySet };
