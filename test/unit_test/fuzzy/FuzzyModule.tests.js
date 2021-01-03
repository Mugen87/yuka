/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const FuzzyJSONs = require( '../../files/FuzzyJSONs.js' );

const FuzzyModule = YUKA.FuzzyModule;
const FuzzyVariable = YUKA.FuzzyVariable;
const FuzzyRule = YUKA.FuzzyRule;
const LeftShoulderFuzzySet = YUKA.LeftShoulderFuzzySet;
const RightShoulderFuzzySet = YUKA.RightShoulderFuzzySet;
const TriangularFuzzySet = YUKA.TriangularFuzzySet;
const FuzzyAND = YUKA.FuzzyAND;

describe( 'FuzzyModule', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const fuzzyModule = new FuzzyModule();

			expect( fuzzyModule ).to.have.a.property( 'rules' ).that.be.an( 'array' );
			expect( fuzzyModule ).to.have.a.property( 'flvs' ).that.is.a( 'map' );

		} );

	} );

	describe( '#addFLV()', function () {

		it( 'should add the given FLV under the given name to this fuzzy module', function () {

			const fuzzyModule = new FuzzyModule();
			const flv = new FuzzyVariable();

			fuzzyModule.addFLV( 'test', flv );

			expect( fuzzyModule.flvs.has( 'test' ) ).to.be.true;
			expect( fuzzyModule.flvs.get( 'test' ) ).to.equal( flv );

		} );

	} );

	describe( '#removeFLV()', function () {

		it( 'should remove the FLV under the given name from this fuzzy module', function () {

			const fuzzyModule = new FuzzyModule();
			const flv = new FuzzyVariable();

			fuzzyModule.addFLV( 'test', flv );
			fuzzyModule.removeFLV( 'test' );

			expect( fuzzyModule.flvs.has( 'test' ) ).to.be.false;

		} );

	} );

	describe( '#addRule()', function () {

		it( 'should add the given fuzzy rule to this fuzzy module', function () {

			const fuzzyModule = new FuzzyModule();
			const rule = new FuzzyRule();

			fuzzyModule.addRule( rule );

			expect( fuzzyModule.rules ).to.include( rule );

		} );

	} );

	describe( '#removeRule()', function () {

		it( 'should remove the given fuzzy rule from this fuzzy module', function () {

			const fuzzyModule = new FuzzyModule();
			const rule = new FuzzyRule();

			fuzzyModule.addRule( rule );
			fuzzyModule.removeRule( rule );

			expect( fuzzyModule.rules ).to.not.include( rule );

		} );

	} );

	describe( '#fuzzify()', function () {

		it( 'should call the fuzzify method of the defined FLV with the given value', function () {

			const fuzzyModule = new FuzzyModule();

			// FLV distance to target

			const distanceToTarget = new FuzzyVariable();

			const targetClose = new LeftShoulderFuzzySet( 0, 25, 150 );
			const targetMedium = new TriangularFuzzySet( 25, 150, 300 );
			const targetFar = new RightShoulderFuzzySet( 150, 300, 500 );

			distanceToTarget.add( targetClose );
			distanceToTarget.add( targetMedium );
			distanceToTarget.add( targetFar );

			fuzzyModule.addFLV( 'distanceToTarget', distanceToTarget );

			// fuzzy inference

			fuzzyModule.fuzzify( 'distanceToTarget', 200 );

			expect( targetClose.degreeOfMembership ).to.equal( 0 );
			expect( targetMedium.degreeOfMembership ).to.closeTo( 0.6666666666666667, Number.EPSILON );
			expect( targetFar.degreeOfMembership ).to.equal( 0.33333333333333337, Number.EPSILON );

		} );

	} );

	describe( '#defuzzify()', function () {

		it( 'should return a crisp value by the given fuzzy variable and the defuzzification method', function () {

			const fuzzyModule = new FuzzyModule();

			// FLV distance to target

			const distanceToTarget = new FuzzyVariable();

			const targetClose = new LeftShoulderFuzzySet( 0, 25, 150 );
			const targetMedium = new TriangularFuzzySet( 25, 150, 300 );
			const targetFar = new RightShoulderFuzzySet( 150, 300, 500 );

			distanceToTarget.add( targetClose );
			distanceToTarget.add( targetMedium );
			distanceToTarget.add( targetFar );

			fuzzyModule.addFLV( 'distanceToTarget', distanceToTarget );

			// FLV ammo status

			const ammoStatus = new FuzzyVariable();

			const ammoLow = new LeftShoulderFuzzySet( 0, 0, 10 );
			const ammoOkay = new TriangularFuzzySet( 0, 10, 30 );
			const ammoFull = new RightShoulderFuzzySet( 10, 30, 40 );

			ammoStatus.add( ammoLow );
			ammoStatus.add( ammoOkay );
			ammoStatus.add( ammoFull );

			fuzzyModule.addFLV( 'ammoStatus', ammoStatus );

			// FLV desirability

			const desirability = new FuzzyVariable();

			const undesirable = new LeftShoulderFuzzySet( 0, 25, 50 );
			const desirable = new TriangularFuzzySet( 25, 50, 75 );
			const veryDesirable = new RightShoulderFuzzySet( 50, 75, 100 );

			desirability.add( undesirable );
			desirability.add( desirable );
			desirability.add( veryDesirable );

			fuzzyModule.addFLV( 'desirability', desirability );

			// rules

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoLow ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoOkay ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoFull ), undesirable ) );

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoLow ), desirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoOkay ), veryDesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoFull ), veryDesirable ) );

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoLow ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoOkay ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoFull ), desirable ) );

			// fuzzy inference

			fuzzyModule.fuzzify( 'distanceToTarget', 200 );
			fuzzyModule.fuzzify( 'ammoStatus', 8 );

			expect( fuzzyModule.defuzzify( 'desirability' ) ).to.closeTo( 60.41666666666667, Number.EPSILON );
			expect( fuzzyModule.defuzzify( 'desirability', FuzzyModule.DEFUZ_TYPE.CENTROID ) ).to.closeTo( 61.85185185185185, Number.EPSILON );

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			// unknown defuzzification method (use MaxAv as fallback)

			expect( fuzzyModule.defuzzify( 'desirability', 2 ) ).to.closeTo( 60.41666666666667, Number.EPSILON );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const fuzzyModule = new FuzzyModule();

			// FLV distance to target

			const distanceToTarget = new FuzzyVariable();

			const targetClose = new LeftShoulderFuzzySet( 0, 25, 150 );
			targetClose._uuid = 'AEBDC6F3-6685-4D2B-B794-0D72BDD79724';
			const targetMedium = new TriangularFuzzySet( 25, 150, 300 );
			targetMedium._uuid = '3D5040DA-CA14-498C-9683-75FDA90DCC94';
			const targetFar = new RightShoulderFuzzySet( 150, 300, 500 );
			targetFar._uuid = '1B9D3587-148A-4970-971D-18F74215A9E5';

			distanceToTarget.add( targetClose );
			distanceToTarget.add( targetMedium );
			distanceToTarget.add( targetFar );

			fuzzyModule.addFLV( 'distanceToTarget', distanceToTarget );

			// FLV ammo status

			const ammoStatus = new FuzzyVariable();

			const ammoLow = new LeftShoulderFuzzySet( 0, 0, 10 );
			ammoLow._uuid = 'A8AA410F-2308-43FE-828E-E5ACD2DF7A9A';
			const ammoOkay = new TriangularFuzzySet( 0, 10, 30 );
			ammoOkay._uuid = '2ADCF93F-EC88-4ADB-AE88-BE357FC84F1A';
			const ammoFull = new RightShoulderFuzzySet( 10, 30, 40 );
			ammoFull._uuid = '1D583EFA-F942-4D5F-83FC-D9224399FD22';

			ammoStatus.add( ammoLow );
			ammoStatus.add( ammoOkay );
			ammoStatus.add( ammoFull );

			fuzzyModule.addFLV( 'ammoStatus', ammoStatus );

			// FLV desirability

			const desirability = new FuzzyVariable();

			const undesirable = new LeftShoulderFuzzySet( 0, 25, 50 );
			undesirable._uuid = '7FD5572F-CF00-4031-941D-B8BB4F93A7EF';
			const desirable = new TriangularFuzzySet( 25, 50, 75 );
			desirable._uuid = '043B0816-E790-44EE-8C4A-21AC7C27DE7F';
			const veryDesirable = new RightShoulderFuzzySet( 50, 75, 100 );
			veryDesirable._uuid = '208D9144-14EC-44BD-95DD-B6035ACEE31B';

			desirability.add( undesirable );
			desirability.add( desirable );
			desirability.add( veryDesirable );

			fuzzyModule.addFLV( 'desirability', desirability );

			// rules

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoLow ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoOkay ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoFull ), undesirable ) );

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoLow ), desirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoOkay ), veryDesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoFull ), veryDesirable ) );

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoLow ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoOkay ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoFull ), desirable ) );

			expect( fuzzyModule.toJSON() ).to.be.deep.equal( FuzzyJSONs.FuzzyModule );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const fuzzyModule = new FuzzyModule();

			// FLV distance to target

			const distanceToTarget = new FuzzyVariable();

			const targetClose = new LeftShoulderFuzzySet( 0, 25, 150 );
			targetClose._uuid = 'AEBDC6F3-6685-4D2B-B794-0D72BDD79724';
			const targetMedium = new TriangularFuzzySet( 25, 150, 300 );
			targetMedium._uuid = '3D5040DA-CA14-498C-9683-75FDA90DCC94';
			const targetFar = new RightShoulderFuzzySet( 150, 300, 500 );
			targetFar._uuid = '1B9D3587-148A-4970-971D-18F74215A9E5';

			distanceToTarget.add( targetClose );
			distanceToTarget.add( targetMedium );
			distanceToTarget.add( targetFar );

			fuzzyModule.addFLV( 'distanceToTarget', distanceToTarget );

			// FLV ammo status

			const ammoStatus = new FuzzyVariable();

			const ammoLow = new LeftShoulderFuzzySet( 0, 0, 10 );
			ammoLow._uuid = 'A8AA410F-2308-43FE-828E-E5ACD2DF7A9A';
			const ammoOkay = new TriangularFuzzySet( 0, 10, 30 );
			ammoOkay._uuid = '2ADCF93F-EC88-4ADB-AE88-BE357FC84F1A';
			const ammoFull = new RightShoulderFuzzySet( 10, 30, 40 );
			ammoFull._uuid = '1D583EFA-F942-4D5F-83FC-D9224399FD22';

			ammoStatus.add( ammoLow );
			ammoStatus.add( ammoOkay );
			ammoStatus.add( ammoFull );

			fuzzyModule.addFLV( 'ammoStatus', ammoStatus );

			// FLV desirability

			const desirability = new FuzzyVariable();

			const undesirable = new LeftShoulderFuzzySet( 0, 25, 50 );
			undesirable._uuid = '7FD5572F-CF00-4031-941D-B8BB4F93A7EF';
			const desirable = new TriangularFuzzySet( 25, 50, 75 );
			desirable._uuid = '043B0816-E790-44EE-8C4A-21AC7C27DE7F';
			const veryDesirable = new RightShoulderFuzzySet( 50, 75, 100 );
			veryDesirable._uuid = '208D9144-14EC-44BD-95DD-B6035ACEE31B';

			desirability.add( undesirable );
			desirability.add( desirable );
			desirability.add( veryDesirable );

			fuzzyModule.addFLV( 'desirability', desirability );

			// rules

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoLow ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoOkay ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetClose, ammoFull ), undesirable ) );

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoLow ), desirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoOkay ), veryDesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetMedium, ammoFull ), veryDesirable ) );

			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoLow ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoOkay ), undesirable ) );
			fuzzyModule.addRule( new FuzzyRule( new FuzzyAND( targetFar, ammoFull ), desirable ) );

			const fuzzyModule2 = new FuzzyModule().fromJSON( FuzzyJSONs.FuzzyModule );

			expect( fuzzyModule ).to.be.deep.equal( fuzzyModule2 );

		} );

	} );

} );
