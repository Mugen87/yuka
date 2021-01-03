/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const FuzzyJSONs = require( '../../files/FuzzyJSONs.js' );

const FuzzyRule = YUKA.FuzzyRule;
const FuzzyTerm = YUKA.FuzzyTerm;
const FuzzySet = YUKA.FuzzySet;
const FuzzyCompositeTerm = YUKA.FuzzyCompositeTerm;
const FuzzyAND = YUKA.FuzzyAND;
const FuzzyOR = YUKA.FuzzyOR;
const FuzzyVERY = YUKA.FuzzyVERY;
const FuzzyFAIRLY = YUKA.FuzzyFAIRLY;

describe( 'FuzzyRule', function () {

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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const fuzzySet1 = new FuzzySet();
			fuzzySet1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const fuzzySet2 = new FuzzySet();
			fuzzySet2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const rule = new FuzzyRule( fuzzySet1, fuzzySet2 );

			expect( rule.toJSON() ).to.be.deep.equal( FuzzyJSONs.FuzzyRuleAtomic );

		} );

		it( 'should also serialize composite terms', function () {

			const rule = new FuzzyRule( new FuzzyCompositeTerm(), new FuzzyCompositeTerm() );

			expect( rule.toJSON() ).to.be.deep.equal( FuzzyJSONs.FuzzyRuleComposite );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const fuzzySet1 = new FuzzySet();
			fuzzySet1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const fuzzySet2 = new FuzzySet();
			fuzzySet2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const fuzzySet3 = new FuzzySet();
			fuzzySet3._uuid = '89876371-0D9B-44F0-BDC9-5D7C6B47A4CF';

			const fuzzySet4 = new FuzzySet();
			fuzzySet4._uuid = 'C52406C9-A359-4AA5-B1E0-9430B9DCEDE9';

			const antecedent = new FuzzyAND( new FuzzyVERY( fuzzySet1 ), new FuzzyFAIRLY( fuzzySet2 ) );
			const consequence = new FuzzyOR( fuzzySet3, fuzzySet4 );

			const rule1 = new FuzzyRule( antecedent, consequence );

			const fuzzySets = new Map();
			fuzzySets.set( '4C06581E-448A-4557-835E-7A9D2CE20D30', fuzzySet1 );
			fuzzySets.set( '52A33A16-6843-4C98-9A8E-9FCEA255A481', fuzzySet2 );
			fuzzySets.set( '89876371-0D9B-44F0-BDC9-5D7C6B47A4CF', fuzzySet3 );
			fuzzySets.set( 'C52406C9-A359-4AA5-B1E0-9430B9DCEDE9', fuzzySet4 );

			const rule2 = new FuzzyRule().fromJSON( FuzzyJSONs.FuzzyRuleComplex, fuzzySets );

			expect( rule1 ).to.be.deep.equal( rule2 );

		} );

		it( 'should log an error if the JSON contains a wrong type definition for a fuzzy operator', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			const rule = new FuzzyRule();

			rule.fromJSON( FuzzyJSONs.FuzzyRuleWrongType );

			expect( rule.antecedent ).to.be.undefined;
			expect( rule.consequence ).to.be.undefined;

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
