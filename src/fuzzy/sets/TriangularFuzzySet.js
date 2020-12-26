import { FuzzySet } from '../FuzzySet.js';

/**
* Class for representing a fuzzy set that has a triangular shape. It can be defined
* by a left point, a midpoint (peak) and a right point.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzySet
*/
class TriangularFuzzySet extends FuzzySet {

	/**
	* Constructs a new triangular fuzzy set with the given values.
	*
	* @param {Number} left - Represents the left border of this fuzzy set.
	* @param {Number} midpoint - Represents the peak value of this fuzzy set.
	* @param {Number} right - Represents the right border of this fuzzy set.
	*/
	constructor( left = 0, midpoint = 0, right = 0 ) {

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

		// find DOM if the given value is right of the center

		if ( ( value > midpoint ) && ( value <= right ) ) {

			const grad = 1 / ( right - midpoint );

			return grad * ( right - value );

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
	* @return {TriangularFuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.midpoint = json.midpoint;

		return this;

	}

}

export { TriangularFuzzySet };
