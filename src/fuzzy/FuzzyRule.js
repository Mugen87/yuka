/**
* Class for representing a fuzzy rule. Fuzzy rules are comprised of an antecedent and
* a consequent in the form: IF antecedent THEN consequent.
*
* Compared to ordinary if/else statements with discrete values, the consequent term
* of a fuzzy rule can fire to a matter of degree.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class FuzzyRule {

	/**
	* Constructs a new fuzzy rule with the given values.
	*
	* @param {FuzzyTerm} antecedent - Represents the condition of the rule.
	* @param {FuzzyTerm} consequence - Describes the consequence if the condition is satisfied.
	*/
	constructor( antecedent = null, consequence = null ) {

		/**
		* Represents the condition of the rule.
		* @type FuzzyTerm
		* @default null
		*/
		this.antecedent = antecedent;

		/**
		* Describes the consequence if the condition is satisfied.
		* @type FuzzyTerm
		* @default null
		*/
		this.consequence = consequence;

	}

	/**
	* Initializes the consequent term of this fuzzy rule.
	*
	* @return {FuzzyRule} A reference to this fuzzy rule.
	*/
	initConsequence() {

		this.consequence.clearDegreeOfMembership();

		return this;

	}

	/**
	* Evaluates the rule and updates the degree of membership of the consequent term with
  * the degree of membership of the antecedent term.
	*
	* @return {FuzzyRule} A reference to this fuzzy rule.
	*/
	evaluate() {

		this.consequence.updateDegreeOfMembership( this.antecedent.getDegreeOfMembership() );

		return this;

	}

}

export { FuzzyRule };
