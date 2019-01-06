import { FuzzyCompositeTerm } from '../FuzzyCompositeTerm.js';

/**
* Class for representing an OR operator. Can be used to construct
* fuzzy rules.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments FuzzyCompositeTerm
*/
class FuzzyOR extends FuzzyCompositeTerm {

	/**
	* Constructs a new fuzzy AND operator with the given values. The constructor
	* accepts and arbitrary amount of fuzzy terms.
	*/
	constructor() {

		const terms = Array.from( arguments );

		super( terms );

	}

	/**
	* Returns the degree of membership. The AND operator returns the maximum
	* degree of membership of the sets it is operating on.
	*
	* @return {Number} Degree of membership.
	*/
	getDegreeOfMembership() {

		const terms = this.terms;
		let maxDOM = - Infinity;

		for ( let i = 0, l = terms.length; i < l; i ++ ) {

			const term = terms[ i ];
			const currentDOM = term.getDegreeOfMembership();

			if ( currentDOM > maxDOM ) maxDOM = currentDOM;

		}

		return maxDOM;

	}

}

export { FuzzyOR };
