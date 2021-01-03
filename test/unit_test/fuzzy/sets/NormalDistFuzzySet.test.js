/**
 * @author robp94 / https://github.com/robp94
 */
const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const FuzzyJSONs = require( '../../../files/FuzzyJSONs.js' );

const NormalDistFuzzySet = YUKA.NormalDistFuzzySet;
const FuzzySet = YUKA.FuzzySet;

describe( 'NormalDistFuzzySet', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const fuzzySet = new NormalDistFuzzySet();

			expect( fuzzySet ).to.have.a.property( 'left' ).that.is.equal( 0 );
			expect( fuzzySet ).to.have.a.property( 'midpoint' ).that.is.equal( 0 );
			expect( fuzzySet ).to.have.a.property( 'right' ).that.is.equal( 0 );
			expect( fuzzySet ).to.have.a.property( 'standardDeviation' ).that.is.equal( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const fuzzySet = new NormalDistFuzzySet( 0, 50, 100, 15 );

			expect( fuzzySet.left ).to.equal( 0 );
			expect( fuzzySet.midpoint ).to.equal( 50 );
			expect( fuzzySet.right ).to.equal( 100 );

		} );

		it( 'should inherit from FuzzySet', function () {

			const fuzzySet = new NormalDistFuzzySet();

			expect( fuzzySet ).is.an.instanceof( FuzzySet );

		} );

	} );

	describe( '#computeDegreeOfMembership()', function () {

		it( 'should compute degree of membership for the given value', function () {

			const fuzzySet = new NormalDistFuzzySet( 0, 50, 100, 15 );

			expect( fuzzySet.computeDegreeOfMembership( 0 ) ).to.equal( 0 );
			expect( fuzzySet.computeDegreeOfMembership( 35 ) ).to.closeTo( 0.6065306597126335, Number.EPSILON );
			expect( fuzzySet.computeDegreeOfMembership( 50 ) ).to.equal( 1 );
			expect( fuzzySet.computeDegreeOfMembership( 65 ) ).to.closeTo( 0.6065306597126335, Number.EPSILON );
			expect( fuzzySet.computeDegreeOfMembership( 100 ) ).to.equal( 0 );

			// out of range values

			expect( fuzzySet.computeDegreeOfMembership( - 1 ) ).to.equal( 0 );
			expect( fuzzySet.computeDegreeOfMembership( 101 ) ).to.equal( 0 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const fuzzySet = new NormalDistFuzzySet( 0, 50, 100, 15 );
			fuzzySet._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30'; // overwrite random UUID

			expect( fuzzySet.toJSON() ).to.be.deep.equal( FuzzyJSONs.NormalDistFuzzySet );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const fuzzySet1 = new NormalDistFuzzySet( 0, 50, 100, 15 );
			fuzzySet1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30'; // overwrite random UUID

			const fuzzySet2 = new NormalDistFuzzySet().fromJSON( FuzzyJSONs.NormalDistFuzzySet );

			expect( fuzzySet1 ).to.be.deep.equal( fuzzySet2 );

		} );

	} );

} );
