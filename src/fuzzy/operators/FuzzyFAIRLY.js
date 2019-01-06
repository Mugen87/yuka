import { FuzzyTerm } from '../FuzzyTerm.js';

/**
* Hedges are special unary operators that can be employed to modify the meaning
* of a fuzzy set. The FAIRLY fuzzy hedge widens the membership function.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyTerm
*/
class FuzzyFAIRLY extends FuzzyTerm {

	/**
	* Constructs a new fuzzy FAIRLY hedge with the given values.
	*
	* @param {FuzzyTerm} fuzzyTerm - The fuzzy term this hedge is working on.
	*/
	constructor( fuzzyTerm = null ) {

		super();

		/**
		* The fuzzy term this hedge is working on.
		* @type FuzzyTerm
		* @default null
		*/
		this.fuzzyTerm = fuzzyTerm;

	}

	// FuzzyTerm API

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyFAIRLY} A reference to this fuzzy hedge.
	*/
	clearDegreeOfMembership() {

		this.fuzzyTerm.clearDegreeOfMembership();

		return this;

	}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const dom = this.fuzzyTerm.getDegreeOfMembership();

		return Math.sqrt( dom );

	}

	/**
	* Updates the degree of membership by the given value.
	*
	* @return {FuzzyFAIRLY} A reference to this fuzzy hedge.
	*/
	updateDegreeOfMembership( value ) {

		this.fuzzyTerm.updateDegreeOfMembership( Math.sqrt( value ) );

		return this;

	}

}

export { FuzzyFAIRLY };
