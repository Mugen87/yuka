/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


const PursuitBehavior = YUKA.PursuitBehavior;
const SeekBehavior = YUKA.SeekBehavior;
const Vehicle = YUKA.Vehicle;
const Vector3 = YUKA.Vector3;

describe( 'PursuitBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const pursuitBehavior = new PursuitBehavior();
			expect( pursuitBehavior ).to.have.a.property( 'evader' ).that.is.null;
			expect( pursuitBehavior ).to.have.a.property( 'predictionFactor' ).that.is.equal( 1 );
			expect( pursuitBehavior ).to.have.a.property( '_seek' ).that.is.an.instanceof( SeekBehavior );

		} );

		it( 'should apply the parameters to the new object', function () {

			const evader = new Vehicle();
			const pursuitBehavior = new PursuitBehavior( evader, 2 );
			expect( pursuitBehavior.evader ).to.equal( evader );
			expect( pursuitBehavior.predictionFactor ).to.equal( 2 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should seek to the evader if it is in front and directly facing the pursuer', function () {

			const evader = new Vehicle();
			const pursuer = new Vehicle();
			const force = new Vector3();

			evader.position.set( 0, 0, 10 );
			evader.rotation.set( 0, 1, 0, 0 );

			const pursuitBehavior = new PursuitBehavior( evader );

			pursuitBehavior.calculate( pursuer, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should predict the future position of the evader if it is not ahead of the pursuer', function () {

			const evader = new Vehicle();
			const pursuer = new Vehicle();
			const force = new Vector3();

			evader.position.set( 0, 0, - 10 );
			evader.velocity.set( 0, 1, 0 );

			const pursuitBehavior = new PursuitBehavior( evader );

			pursuitBehavior.calculate( pursuer, force );

			expect( force.x ).to.closeTo( 0, Number.EPSILON );
			expect( force.y ).to.closeTo( 0.4472135954999579, Number.EPSILON );
			expect( force.z ).to.closeTo( - 0.8944271909999159, Number.EPSILON );

		} );

		it( 'should use the predictionFactor to tweak the look ahead time', function () {

			const evader = new Vehicle();
			const pursuer = new Vehicle();
			const force = new Vector3();

			evader.position.set( 0, 0, - 10 );
			evader.velocity.set( 0, 1, 0 );

			const pursuitBehavior = new PursuitBehavior( evader );
			pursuitBehavior.predictionFactor = 2;

			pursuitBehavior.calculate( pursuer, force );

			expect( force.x ).to.closeTo( 0, Number.EPSILON );
			expect( force.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( force.z ).to.closeTo( - 0.7071067811865475, Number.EPSILON );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const evader = new Vehicle();
			evader._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			const pursuitBehavior = new PursuitBehavior( evader, 2 );
			const json = pursuitBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.PursuitBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const evader = new Vehicle();
			evader._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			const pursuitBehavior1 = new PursuitBehavior( evader, 2 );
			const pursuitBehavior2 = new PursuitBehavior().fromJSON( SteeringJSONs.PursuitBehavior );

			const entitiesMap = new Map();
			entitiesMap.set( evader.uuid, evader );
			pursuitBehavior2.resolveReferences( entitiesMap );

			expect( pursuitBehavior1 ).to.deep.equal( pursuitBehavior2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new Vehicle();

			const behavior1 = new PursuitBehavior( entity1 );
			const behavior2 = new PursuitBehavior( );

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			behavior2.evader = entity1.uuid;

			const map = new Map();
			map.set( entity1.uuid, entity1 );

			behavior2.resolveReferences( map );

			expect( behavior2 ).to.deep.equal( behavior1 );

		} );

		it( 'should set the evader to null if the mapping is missing', function () {

			const behavior = new PursuitBehavior();
			behavior.evader = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			behavior.resolveReferences( new Map() );

			expect( behavior.evader ).to.be.null;

		} );

	} );

} );
