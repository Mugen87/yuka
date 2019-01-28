/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const FuzzyJSONs = require( '../../files/FuzzyJSONs.js' );

const FuzzyTerm = YUKA.FuzzyTerm;

describe( 'FuzzyTerm', function () {

	describe( '#clearDegreeOfMembership()', function () {

		it( 'should exist', function () {

			const term = new FuzzyTerm();
			expect( term ).respondTo( 'clearDegreeOfMembership' );
			term.clearDegreeOfMembership();

		} );

	} );

	describe( '#getDegreeOfMembership()', function () {

		it( 'should exist', function () {

			const term = new FuzzyTerm();
			expect( term ).respondTo( 'getDegreeOfMembership' );
			term.getDegreeOfMembership();

		} );

	} );

	describe( '#updateDegreeOfMembership()', function () {

		it( 'should exist', function () {

			const term = new FuzzyTerm();
			expect( term ).respondTo( 'updateDegreeOfMembership' );
			term.updateDegreeOfMembership();

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const term = new FuzzyTerm();

			expect( term.toJSON() ).to.be.deep.equal( FuzzyJSONs.FuzzyTerm );

		} );

	} );

} );
