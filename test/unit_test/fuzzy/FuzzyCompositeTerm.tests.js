/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const FuzzyCompositeTerm = YUKA.FuzzyCompositeTerm;
const FuzzyTerm = YUKA.FuzzyTerm;

describe( 'FuzzyCompositeTerm', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const compositeTerm = new FuzzyCompositeTerm();

			expect( compositeTerm ).to.have.a.property( 'terms' ).that.is.an( 'array' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const atomicTerm1 = new FuzzyTerm();
			const atomicTerm2 = new FuzzyTerm();

			const compositeTerm = new FuzzyCompositeTerm( [ atomicTerm1, atomicTerm2 ] );

			expect( compositeTerm.terms ).to.include( atomicTerm1, atomicTerm2 );

		} );

		it( 'should inherit from FuzzyTerm', function () {

			const compositeTerm = new FuzzyCompositeTerm();

			expect( compositeTerm ).is.an.instanceof( FuzzyTerm );

		} );

	} );

	describe( '#clearDegreeOfMembership()', function () {

		it( 'should execute .clearDegreeOfMembership() for all terms', function () {

			const atomicTerm1 = new CustomFuzzyTerm();
			atomicTerm1.degreeOfMembership = 0.5;
			const atomicTerm2 = new CustomFuzzyTerm();
			atomicTerm2.degreeOfMembership = 0.25;

			const compositeTerm = new FuzzyCompositeTerm( [ atomicTerm1, atomicTerm2 ] );
			compositeTerm.clearDegreeOfMembership();

			expect( atomicTerm1.degreeOfMembership ).to.equal( 0 );
			expect( atomicTerm2.degreeOfMembership ).to.equal( 0 );

		} );

	} );

	describe( '#clearDegreeOfMembership()', function () {

		it( 'should execute .updateDegreeOfMembership() for all terms', function () {

			const atomicTerm1 = new CustomFuzzyTerm();
			const atomicTerm2 = new CustomFuzzyTerm();

			const compositeTerm = new FuzzyCompositeTerm( [ atomicTerm1, atomicTerm2 ] );
			compositeTerm.updateDegreeOfMembership( 0.75 );

			expect( atomicTerm1.degreeOfMembership ).to.equal( 0.75 );
			expect( atomicTerm2.degreeOfMembership ).to.equal( 0.75 );

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
