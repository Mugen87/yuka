/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const FuzzyJSONs = require( '../../files/FuzzyJSONs.js' );

const FuzzyVariable = YUKA.FuzzyVariable;
const FuzzySet = YUKA.FuzzySet;
const LeftShoulderFuzzySet = YUKA.LeftShoulderFuzzySet;
const RightShoulderFuzzySet = YUKA.RightShoulderFuzzySet;
const TriangularFuzzySet = YUKA.TriangularFuzzySet;
const SingletonFuzzySet = YUKA.SingletonFuzzySet;

describe( 'FuzzyVariable', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const flv = new FuzzyVariable();

			expect( flv ).to.have.a.property( 'fuzzySets' ).that.be.an( 'array' );
			expect( flv ).to.have.a.property( 'minRange' ).that.is.equal( Infinity );
			expect( flv ).to.have.a.property( 'maxRange' ).that.is.equal( - Infinity );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add fuzzy set to this fuzzy linguistic variable', function () {

			const fuzzySet = new FuzzySet();
			const flv = new FuzzyVariable();

			flv.add( fuzzySet );

			expect( flv.fuzzySets ).to.include( fuzzySet );

		} );

		it( 'should adjust the min/max range according to the fuzzy sets range', function () {

			const fuzzySet = new FuzzySet();
			fuzzySet.left = 50;
			fuzzySet.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet );

			expect( flv.minRange ).to.equal( 50 );
			expect( flv.maxRange ).to.equal( 100 );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove fuzzy set from this fuzzy linguistic variable', function () {

			const fuzzySet = new FuzzySet();
			const flv = new FuzzyVariable();

			flv.add( fuzzySet );
			flv.remove( fuzzySet );

			expect( flv.fuzzySets ).to.not.include( fuzzySet );

		} );

		it( 'should adjust the min/max range according to the fuzzy sets range', function () {

			const fuzzySet1 = new FuzzySet();
			fuzzySet1.left = 50;
			fuzzySet1.right = 100;

			const fuzzySet2 = new FuzzySet();
			fuzzySet2.left = 75;
			fuzzySet2.right = 125;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			expect( flv.minRange ).to.equal( 50 );
			expect( flv.maxRange ).to.equal( 125 );

			flv.remove( fuzzySet2 );
			expect( flv.minRange ).to.equal( 50 );
			expect( flv.maxRange ).to.equal( 100 );

			flv.remove( fuzzySet1 );
			expect( flv.minRange ).to.equal( Infinity );
			expect( flv.maxRange ).to.equal( - Infinity );

		} );

	} );

	describe( '#fuzzify()', function () {

		it( 'should fuzzify the given value by calculating its degree of membership in each of its fuzzy sets', function () {

			const fuzzySet1 = new CustomFuzzySet( 0.2 );
			fuzzySet1.left = 0;
			fuzzySet1.right = 100;
			const fuzzySet2 = new CustomFuzzySet( 0.7 );
			fuzzySet2.left = 0;
			fuzzySet2.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			flv.fuzzify( 10 );

			expect( fuzzySet1.degreeOfMembership ).to.equal( 2 );
			expect( fuzzySet2.degreeOfMembership ).to.equal( 7 );

		} );

		it( 'should print a warning if the given value is out of range', function () {

			const fuzzySet1 = new CustomFuzzySet( 0.2 );
			fuzzySet1.left = 20;
			fuzzySet1.right = 100;

			const fuzzySet2 = new CustomFuzzySet( 0.7 );
			fuzzySet2.left = 20;
			fuzzySet2.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			flv.fuzzify( 10 );
			flv.fuzzify( 200 );

		} );

	} );

	describe( '#defuzzifyMaxAv()', function () {

		it( 'should defuzzify the FLV using the "Average of Maxima" (MaxAv) method', function () {

			const fuzzySet1 = new CustomFuzzySet( 0.2 );
			fuzzySet1.left = 0;
			fuzzySet1.right = 100;
			const fuzzySet2 = new CustomFuzzySet( 0.7 );
			fuzzySet2.left = 0;
			fuzzySet2.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			flv.fuzzify( 10 );

			expect( fuzzySet1.degreeOfMembership ).to.equal( 2 );
			expect( fuzzySet2.degreeOfMembership ).to.equal( 7 );

			const value = flv.defuzzifyMaxAv();

			// ( ( 2 * 10 ) + ( 7 * 10 ) ) / ( 2 + 7 )

			expect( value ).to.equal( 10 );

		} );

		it( 'should return zero if the total degree of membership is zero', function () {

			const fuzzySet1 = new CustomFuzzySet( 0 );
			fuzzySet1.left = 0;
			fuzzySet1.right = 100;
			const fuzzySet2 = new CustomFuzzySet( 0 );
			fuzzySet2.left = 0;
			fuzzySet2.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			flv.fuzzify( 10 );

			expect( fuzzySet1.degreeOfMembership ).to.equal( 0 );
			expect( fuzzySet2.degreeOfMembership ).to.equal( 0 );

			const value = flv.defuzzifyMaxAv();

			// ( ( 0 * 10 ) + ( 0 * 10 ) ) / ( 0 + 0 )

			expect( value ).to.equal( 0 );

		} );

	} );

	describe( '#defuzzifyCentroid()', function () {

		it( 'should defuzzify the FLV using the "Centroid" method', function () {

			const fuzzySet1 = new CustomFuzzySet( 0.2 );
			fuzzySet1.left = 0;
			fuzzySet1.right = 100;

			const fuzzySet2 = new CustomFuzzySet( 0.7 );
			fuzzySet2.left = 0;
			fuzzySet2.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			flv.fuzzify( 10 );

			expect( fuzzySet1.degreeOfMembership ).to.equal( 2 );
			expect( fuzzySet2.degreeOfMembership ).to.equal( 7 );

			const value = flv.defuzzifyCentroid( 10 );

			expect( value ).to.equal( 55 );

		} );

		it( 'should return zero if the total degree of membership is zero', function () {

			const fuzzySet1 = new CustomFuzzySet( 0 );
			fuzzySet1.left = 0;
			fuzzySet1.right = 100;

			const fuzzySet2 = new CustomFuzzySet( 0 );
			fuzzySet2.left = 0;
			fuzzySet2.right = 100;

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );

			flv.fuzzify( 10 );

			expect( fuzzySet1.degreeOfMembership ).to.equal( 0 );
			expect( fuzzySet2.degreeOfMembership ).to.equal( 0 );

			const value = flv.defuzzifyCentroid(); // use default sample value of 10

			expect( value ).to.equal( 0 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const fuzzySet1 = new LeftShoulderFuzzySet( 0, 50, 100 );
			fuzzySet1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const fuzzySet2 = new RightShoulderFuzzySet( 0, 50, 100 );
			fuzzySet2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const fuzzySet3 = new TriangularFuzzySet( 0, 50, 100 );
			fuzzySet3._uuid = '89876371-0D9B-44F0-BDC9-5D7C6B47A4CF';

			const fuzzySet4 = new SingletonFuzzySet( 0, 50, 100 );
			fuzzySet4._uuid = 'C52406C9-A359-4AA5-B1E0-9430B9DCEDE9';

			const flv = new FuzzyVariable();

			flv.add( fuzzySet1 );
			flv.add( fuzzySet2 );
			flv.add( fuzzySet3 );
			flv.add( fuzzySet4 );

			expect( flv.toJSON() ).to.be.deep.equal( FuzzyJSONs.FuzzyVariable );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const fuzzySet1 = new LeftShoulderFuzzySet( 0, 50, 100 );
			fuzzySet1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const fuzzySet2 = new RightShoulderFuzzySet( 0, 50, 100 );
			fuzzySet2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const fuzzySet3 = new TriangularFuzzySet( 0, 50, 100 );
			fuzzySet3._uuid = '89876371-0D9B-44F0-BDC9-5D7C6B47A4CF';

			const fuzzySet4 = new SingletonFuzzySet( 0, 50, 100 );
			fuzzySet4._uuid = 'C52406C9-A359-4AA5-B1E0-9430B9DCEDE9';

			const flv1 = new FuzzyVariable();

			flv1.add( fuzzySet1 );
			flv1.add( fuzzySet2 );
			flv1.add( fuzzySet3 );
			flv1.add( fuzzySet4 );

			const flv2 = new FuzzyVariable().fromJSON( FuzzyJSONs.FuzzyVariable );

			expect( flv1 ).to.be.deep.equal( flv2 );

		} );

		it( 'should log an error if the JSON contains a wrong type definition for a fuzzy set', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			const flv = new FuzzyVariable();

			flv.fromJSON( FuzzyJSONs.FuzzyVariableWrongType );

			expect( flv.fuzzySets ).to.be.empty;

		} );

	} );

} );

//

class CustomFuzzySet extends FuzzySet {

	constructor( factor ) {

		super();

		this.representativeValue = 10;
		this.factor = factor;

	}

	computeDegreeOfMembership( value ) {

		return this.factor * value;

	}

}
