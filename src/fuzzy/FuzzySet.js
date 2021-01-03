import { FuzzyTerm } from './FuzzyTerm.js';
import { MathUtils } from '../math/MathUtils.js';

/**
* Base class for fuzzy sets. This type of sets are defined by a membership function
* which can be any arbitrary shape but are typically triangular or trapezoidal. They define
* a gradual transition from regions completely outside the set to regions completely
* within the set, thereby enabling a value to have partial membership to a set.
*
* This class is derived from {@link FuzzyTerm} so it can be directly used in fuzzy rules.
* According to the composite design pattern, a fuzzy set can be considered as an atomic fuzzy term.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyTerm
*/
class FuzzySet extends FuzzyTerm {

	/**
	* Constructs a new fuzzy set with the given values.
	*
	* @param {Number} representativeValue - The maximum of the set's membership function.
	*/
	constructor( representativeValue = 0 ) {

		super();

		/**
		* Represents the degree of membership to this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.degreeOfMembership = 0;

		/**
		* The maximum of the set's membership function. For instance, if
		* the set is triangular then this will be the peak point of the triangular.
		* If the set has a plateau then this value will be the mid point of the
		* plateau. Used to avoid runtime calculations.
		* @type {Number}
		* @default 0
		*/
		this.representativeValue = representativeValue;

		/**
		* Represents the left border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.left = 0;

		/**
		* Represents the right border of this fuzzy set.
		* @type {Number}
		* @default 0
		*/
		this.right = 0;

		//

		this._uuid = null;

	}

	/**
	* Unique ID, primarily used in context of serialization/deserialization.
	* @type {String}
	* @readonly
	*/
	get uuid() {

		if ( this._uuid === null ) {

			this._uuid = MathUtils.generateUUID();

		}

		return this._uuid;

	}

	/**
	* Computes the degree of membership for the given value. Notice that this method
	* does not set {@link FuzzySet#degreeOfMembership} since other classes use it in
	* order to calculate intermediate degree of membership values. This method be
	* implemented by all concrete fuzzy set classes.
	*
	* @param {Number} value - The value used to calculate the degree of membership.
	* @return {Number} The degree of membership.
	*/
	computeDegreeOfMembership( /* value */ ) {}

	// FuzzyTerm API

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzySet} A reference to this fuzzy set.
	*/
	clearDegreeOfMembership() {

		this.degreeOfMembership = 0;

		return this;

	}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		return this.degreeOfMembership;

	}

	/**
	* Updates the degree of membership by the given value. This method is used when
	* the set is part of a fuzzy rule's consequent.
	*
	* @return {FuzzySet} A reference to this fuzzy set.
	*/
	updateDegreeOfMembership( value ) {

		// update the degree of membership if the given value is greater than the
		// existing one

		if ( value > this.degreeOfMembership ) this.degreeOfMembership = value;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.degreeOfMembership = this.degreeOfMembership;
		json.representativeValue = this.representativeValue;
		json.left = this.left;
		json.right = this.right;
		json.uuid = this.uuid;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {FuzzySet} A reference to this fuzzy set.
	*/
	fromJSON( json ) {

		this.degreeOfMembership = json.degreeOfMembership;
		this.representativeValue = json.representativeValue;
		this.left = json.left;
		this.right = json.right;

		this._uuid = json.uuid;

		return this;

	}

}

export { FuzzySet };
