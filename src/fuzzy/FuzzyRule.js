import { FuzzyCompositeTerm } from './FuzzyCompositeTerm.js';
import { FuzzyAND } from './operators/FuzzyAND.js';
import { FuzzyOR } from './operators/FuzzyOR.js';
import { FuzzyVERY } from './operators/FuzzyVERY.js';
import { FuzzyFAIRLY } from './operators/FuzzyFAIRLY.js';
import { Logger } from '../core/Logger.js';

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
		* @type {?FuzzyTerm}
		* @default null
		*/
		this.antecedent = antecedent;

		/**
		* Describes the consequence if the condition is satisfied.
		* @type {?FuzzyTerm}
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

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = {};

		const antecedent = this.antecedent;
		const consequence = this.consequence;

		json.type = this.constructor.name;
		json.antecedent = ( antecedent instanceof FuzzyCompositeTerm ) ? antecedent.toJSON() : antecedent.uuid;
		json.consequence = ( consequence instanceof FuzzyCompositeTerm ) ? consequence.toJSON() : consequence.uuid;

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @param {Map<String,FuzzySet>} fuzzySets - Maps fuzzy sets to UUIDs.
	* @return {FuzzyRule} A reference to this fuzzy rule.
	*/
	fromJSON( json, fuzzySets ) {

		function parseTerm( termJSON ) {

			if ( typeof termJSON === 'string' ) {

				// atomic term -> FuzzySet

				const uuid = termJSON;
				return fuzzySets.get( uuid ) || null;

			} else {

				// composite term

				const type = termJSON.type;

				let term;

				switch ( type ) {

					case 'FuzzyAND':
						term = new FuzzyAND();
						break;

					case 'FuzzyOR':
						term = new FuzzyOR();
						break;

					case 'FuzzyVERY':
						term = new FuzzyVERY();
						break;

					case 'FuzzyFAIRLY':
						term = new FuzzyFAIRLY();
						break;

					default:
						Logger.error( 'YUKA.FuzzyRule: Unsupported operator type:', type );
						return;

				}

				const termsJSON = termJSON.terms;

				for ( let i = 0, l = termsJSON.length; i < l; i ++ ) {

					// recursively parse all subordinate terms

					term.terms.push( parseTerm( termsJSON[ i ] ) );

				}

				return term;

			}

		}

		this.antecedent = parseTerm( json.antecedent );
		this.consequence = parseTerm( json.consequence );

		return this;

	}

}

export { FuzzyRule };
