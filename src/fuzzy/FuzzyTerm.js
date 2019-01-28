/**
* Base class for representing a term in a {@link FuzzyRule}.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyTerm {

	/**
	* Clears the degree of membership value.
	*
	* @return {FuzzyTerm} A reference to this term.
	*/
	clearDegreeOfMembership() {}

	/**
	* Returns the degree of membership.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {}

	/**
	* Updates the degree of membership by the given value. This method is used when
	* the term is part of a fuzzy rule's consequent.
	*
	* @param {Number} value - The value used to update the degree of membership.
	* @return {FuzzyTerm} A reference to this term.
	*/
	updateDegreeOfMembership( /* value */ ) {}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name
		};

	}

}

export { FuzzyTerm };
