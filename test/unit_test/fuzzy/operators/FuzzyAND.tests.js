/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const FuzzyAND = YUKA.FuzzyAND;
const FuzzyTerm = YUKA.FuzzyTerm;
const FuzzyCompositeTerm = YUKA.FuzzyCompositeTerm;

describe( 'FuzzyAND', function () {

	describe( '#constructor()', function () {

		it( 'should apply the parameters to the new object', function () {

			const term1 = new FuzzyTerm();
			const term2 = new FuzzyTerm();
			const term3 = new FuzzyTerm();
			const term4 = new FuzzyTerm();

			const operator = new FuzzyAND( term1, term2, term3, term4 );

			expect( operator.terms ).to.include( term1, term2, term3, term4 );

		} );

		it( 'should inherit from FuzzyCompositeTerm', function () {

			const operator = new FuzzyAND();

			expect( operator ).is.an.instanceof( FuzzyCompositeTerm );

		} );

	} );

	describe( '#getDegreeOfMembership()', function () {

		it( 'should return the minimum degree of membership of the sets it is operating on', function () {

			const term1 = new CustomFuzzyTerm();
			term1.degreeOfMembership = 0.2;
			const term2 = new CustomFuzzyTerm();
			term2.degreeOfMembership = 0.5;

			const operator = new FuzzyAND( term1, term2 );

			expect( operator.getDegreeOfMembership() ).to.equal( 0.2 );

		} );

	} );

} );

//

class CustomFuzzyTerm extends FuzzyTerm {

	constructor() {

		super();

		this.degreeOfMembership = 0;

	}

	getDegreeOfMembership() {

		return this.degreeOfMembership;

	}

}
