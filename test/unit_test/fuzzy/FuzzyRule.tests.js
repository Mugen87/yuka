/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const FuzzyRule = YUKA.FuzzyRule;
const FuzzyTerm = YUKA.FuzzyTerm;

describe( 'FuzzySet', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const fuzzyRule = new FuzzyRule();

			expect( fuzzyRule ).to.have.a.property( 'antecedent' ).that.is.null;
			expect( fuzzyRule ).to.have.a.property( 'consequence' ).that.is.null;

		} );

		it( 'should apply the parameters to the new object', function () {

			const term1 = new FuzzyTerm();
			const term2 = new FuzzyTerm();

			const fuzzyRule = new FuzzyRule( term1, term2 );

			expect( fuzzyRule.antecedent ).to.equal( term1 );
			expect( fuzzyRule.consequence ).to.equal( term2 );

		} );

	} );

	describe( '#initConsequence()', function () {

		it( 'should initializes the consequent term of this fuzzy rule', function () {

			const term1 = new CustomFuzzyTerm();
			const term2 = new CustomFuzzyTerm();

			const fuzzyRule = new FuzzyRule( term1, term2 );

			fuzzyRule.initConsequence();

			expect( term1.degreeOfMembership ).to.equal( 0.5 );
			expect( term2.degreeOfMembership ).to.equal( 0 );

		} );

	} );

	describe( '#evaluate()', function () {

		it( 'should update the degree of membership of the consequent term with the degree of membership of the antecedent term', function () {

			const term1 = new CustomFuzzyTerm();
			term1.degreeOfMembership = 0.7;
			const term2 = new CustomFuzzyTerm();

			const fuzzyRule = new FuzzyRule( term1, term2 );

			fuzzyRule.evaluate();

			expect( term1.degreeOfMembership ).to.equal( 0.7 );
			expect( term2.degreeOfMembership ).to.equal( 0.7 );

		} );

	} );

} );

//

class CustomFuzzyTerm extends FuzzyTerm {

	constructor() {

		super();

		this.degreeOfMembership = 0.5;

	}

	clearDegreeOfMembership() {

		this.degreeOfMembership = 0;

	}

	getDegreeOfMembership() {

		return this.degreeOfMembership;

	}

	updateDegreeOfMembership( value ) {

		this.degreeOfMembership = value;

	}

}
