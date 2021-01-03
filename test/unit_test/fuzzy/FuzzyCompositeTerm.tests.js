/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const FuzzyJSONs = require( '../../files/FuzzyJSONs.js' );

const FuzzyCompositeTerm = YUKA.FuzzyCompositeTerm;
const FuzzyTerm = YUKA.FuzzyTerm;
const FuzzyAND = YUKA.FuzzyAND;
const FuzzyVERY = YUKA.FuzzyVERY;
const LeftShoulderFuzzySet = YUKA.LeftShoulderFuzzySet;
const RightShoulderFuzzySet = YUKA.RightShoulderFuzzySet;

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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const fuzzySet1 = new LeftShoulderFuzzySet();
			fuzzySet1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const fuzzySet2 = new RightShoulderFuzzySet();
			fuzzySet2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const fuzzySet3 = new RightShoulderFuzzySet();
			fuzzySet3._uuid = '34E1C456-E6C9-45EC-8AB2-F81D9121A223';

			const term1 = new FuzzyAND( new FuzzyVERY( fuzzySet1 ), fuzzySet2 );
			const term2 = fuzzySet3;

			const compositeTerm = new FuzzyCompositeTerm( [ term1, term2 ] );

			expect( compositeTerm.toJSON() ).to.be.deep.equal( FuzzyJSONs.FuzzyCompositeTerm );

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
