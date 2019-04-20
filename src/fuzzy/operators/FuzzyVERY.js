import { FuzzyCompositeTerm } from '../FuzzyCompositeTerm.js';

/**
* Hedges are special unary operators that can be employed to modify the meaning
* of a fuzzy set. The FAIRLY fuzzy hedge widens the membership function.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyCompositeTerm
*/
class FuzzyVERY extends FuzzyCompositeTerm {

	/**
	* Constructs a new fuzzy VERY hedge with the given values.
	*
	* @param {FuzzyTerm} fuzzyTerm - The fuzzy term this hedge is working on.
	*/
	constructor( fuzzyTerm = null ) {

		const terms = ( fuzzyTerm !== null ) ? [ fuzzyTerm ] : new Array();

		super( terms );

	}

	// FuzzyTerm API

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyVERY} A reference to this fuzzy hedge.
	*/
	clearDegreeOfMembership() {

		const fuzzyTerm = this.terms[ 0 ];
		fuzzyTerm.clearDegreeOfMembership();

		return this;

	}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const fuzzyTerm = this.terms[ 0 ];
		const dom = fuzzyTerm.getDegreeOfMembership();

		return dom * dom;

	}

	/**
	* Updates the degree of membership by the given value.
	*
	* @return {FuzzyVERY} A reference to this fuzzy hedge.
	*/
	updateDegreeOfMembership( value ) {

		const fuzzyTerm = this.terms[ 0 ];
		fuzzyTerm.updateDegreeOfMembership( value * value );

		return this;

	}

}

export { FuzzyVERY };
