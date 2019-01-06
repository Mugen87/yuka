import { FuzzySet } from '../FuzzySet.js';

/**
* Class for representing a fuzzy set that is a singleton. In its range, the degree of
* membership is always one.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class SingletonFuzzySet extends FuzzySet {

	/**
	* Constructs a new singleton fuzzy set with the given values. {@link SingletonFuzzySet#midpoint}
	* is not needed in this class but it's still present in order to have a common interface for all
	* fuzzy sets.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

		super( midpoint );

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

		const left = this.left;
		const right = this.right;

		return ( value >= left && value <= right ) ? 1 : 0;

	}

}

export { SingletonFuzzySet };
