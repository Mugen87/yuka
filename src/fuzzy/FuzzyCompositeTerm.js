import { FuzzyTerm } from './FuzzyTerm.js';

/**
* Base class for representing more complex fuzzy terms based on the
* composite design pattern.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyTerm
*/
class FuzzyCompositeTerm extends FuzzyTerm {

	/**
	* Constructs a new fuzzy composite term with the given values.
	*
	* @param {Array} terms - An arbitrary amount of fuzzy terms.
	*/
	constructor( terms = [] ) {

		super();

		/**
		* List of fuzzy terms.
		* @type Array
		*/
		this.terms = terms;

	}

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyCompositeTerm} A reference to this term.
	*/
	clearDegreeOfMembership() {

		const terms = this.terms;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			terms[ i ].clearDegreeOfMembership();

		}

		return this;

	}

	/**
	* Updates the degree of membership by the given value. This method is used when
	* the term is part of a fuzzy rule's consequent.
	*
	* @param {Number} value - The value used to update the degree of membership.
	* @return {FuzzyCompositeTerm} A reference to this term.
	*/
	updateDegreeOfMembership( value ) {

		const terms = this.terms;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			terms[ i ].updateDegreeOfMembership( value );

		}

		return this;

	}

}

export { FuzzyCompositeTerm };
