/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const FuzzyFAIRLY = YUKA.FuzzyFAIRLY;
const FuzzyTerm = YUKA.FuzzyTerm;
const FuzzyCompositeTerm = YUKA.FuzzyCompositeTerm;

describe( 'FuzzyFAIRLY', function () {

	describe( '#constructor()', function () {

		it( 'should apply the parameters to the new object', function () {

			const fuzzyTerm = new FuzzyTerm();
			const hedge = new FuzzyFAIRLY( fuzzyTerm );

			expect( hedge.terms ).to.include( fuzzyTerm );

		} );

		it( 'should inherit from FuzzyCompositeTerm', function () {

			const hedge = new FuzzyFAIRLY();

			expect( hedge ).is.an.instanceof( FuzzyCompositeTerm );

		} );

	} );

	describe( '#clearDegreeOfMembership()', function () {

		it( 'should set the degree of membership to 0', function () {

			const fuzzyTerm = new CustomFuzzyTerm();
			fuzzyTerm.degreeOfMembership = 0.25;

			const hedge = new FuzzyFAIRLY( fuzzyTerm );
			hedge.clearDegreeOfMembership();

			expect( hedge.terms[ 0 ].degreeOfMembership ).to.equal( 0 );

		} );

	} );

	describe( '#getDegreeOfMembership()', function () {

		it( 'should return the degree of membership by computing the square', function () {

			const fuzzyTerm = new CustomFuzzyTerm();
			fuzzyTerm.degreeOfMembership = 0.25;

			const hedge = new FuzzyFAIRLY( fuzzyTerm );

			expect( hedge.getDegreeOfMembership() ).to.closeTo( 0.5, Number.EPSILON );

		} );

	} );

	describe( '#updateDegreeOfMembership()', function () {

		it( 'should update the degree of membership if the square of the given value', function () {

			const fuzzyTerm = new CustomFuzzyTerm();
			const hedge = new FuzzyFAIRLY( fuzzyTerm );

			hedge.updateDegreeOfMembership( 0.25 );
			expect( fuzzyTerm.degreeOfMembership ).to.closeTo( 0.5, Number.EPSILON );

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
