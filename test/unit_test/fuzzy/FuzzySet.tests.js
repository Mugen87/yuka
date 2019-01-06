/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const FuzzySet = YUKA.FuzzySet;
const FuzzyTerm = YUKA.FuzzyTerm;

describe( 'FuzzySet', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const fuzzySet = new FuzzySet();

			expect( fuzzySet ).to.have.a.property( 'degreeOfMembership' ).that.is.equal( 0 );
			expect( fuzzySet ).to.have.a.property( 'representativeValue' ).that.is.equal( 0 );
			expect( fuzzySet ).to.have.a.property( 'left' ).that.is.equal( 0 );
			expect( fuzzySet ).to.have.a.property( 'right' ).that.is.equal( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const fuzzySet = new FuzzySet( 1 );

			expect( fuzzySet.representativeValue ).to.equal( 1 );

		} );

		it( 'should inherit from FuzzyTerm', function () {

			const fuzzySet = new FuzzySet();

			expect( fuzzySet ).is.an.instanceof( FuzzyTerm );

		} );

	} );

	describe( '#computeDegreeOfMembership()', function () {

		it( 'should exist', function () {

			const fuzzySet = new FuzzySet();
			expect( fuzzySet ).respondTo( 'computeDegreeOfMembership' );
			fuzzySet.computeDegreeOfMembership();

		} );

	} );

	describe( '#clearDegreeOfMembership()', function () {

		it( 'should set the degree of membership to 0', function () {

			const fuzzySet = new FuzzySet();
			fuzzySet.degreeOfMembership = 1;
			fuzzySet.clearDegreeOfMembership();

			expect( fuzzySet.degreeOfMembership ).to.equal( 0 );

		} );

	} );

	describe( '#getDegreeOfMembership()', function () {

		it( 'should return the degree of membership', function () {

			const fuzzySet = new FuzzySet();
			fuzzySet.degreeOfMembership = 1;

			expect( fuzzySet.getDegreeOfMembership() ).to.equal( 1 );

		} );

	} );

	describe( '#updateDegreeOfMembership()', function () {

		it( 'should update the degree of membership if the given value is greater than the existing one', function () {

			const fuzzySet = new FuzzySet();
			fuzzySet.degreeOfMembership = 0.5;

			fuzzySet.updateDegreeOfMembership( 0.25 );
			expect( fuzzySet.getDegreeOfMembership() ).to.equal( 0.5 );

			fuzzySet.updateDegreeOfMembership( 0.75 );
			expect( fuzzySet.getDegreeOfMembership() ).to.equal( 0.75 );

		} );

	} );

} );
