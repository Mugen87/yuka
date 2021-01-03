/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


const EvadeBehavior = YUKA.EvadeBehavior;
const FleeBehavior = YUKA.FleeBehavior;
const Vehicle = YUKA.Vehicle;
const Vector3 = YUKA.Vector3;

describe( 'EvadeBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const evadeBehavior = new EvadeBehavior();
			expect( evadeBehavior ).to.have.a.property( 'pursuer' ).that.is.null;
			expect( evadeBehavior ).to.have.a.property( 'panicDistance' ).that.is.equal( 10 );
			expect( evadeBehavior ).to.have.a.property( 'predictionFactor' ).that.is.equal( 1 );
			expect( evadeBehavior ).to.have.a.property( '_flee' ).that.is.an.instanceof( FleeBehavior );

		} );

		it( 'should apply the parameters to the new object', function () {

			const pursuer = new Vehicle();
			const evadeBehavior = new EvadeBehavior( pursuer, 20, 2 );
			expect( evadeBehavior.pursuer ).to.equal( pursuer );
			expect( evadeBehavior.panicDistance ).to.equal( 20 );
			expect( evadeBehavior.predictionFactor ).to.equal( 2 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should predict the future position of the pursuer during the escape', function () {

			const evader = new Vehicle();
			const pursuer = new Vehicle();
			const force = new Vector3();

			pursuer.position.set( 0, 0, - 5 );
			pursuer.velocity.set( 0, 1, 0 );

			const evadeBehavior = new EvadeBehavior( pursuer );

			evadeBehavior.calculate( evader, force );

			expect( force.x ).to.closeTo( 0, Number.EPSILON );
			expect( force.y ).to.closeTo( - 0.4472135954999579, Number.EPSILON );
			expect( force.z ).to.closeTo( 0.8944271909999159, Number.EPSILON );

		} );

		it( 'should produce no force when the pursuer is outside of the panic distance', function () {

			const evader = new Vehicle();
			const pursuer = new Vehicle();
			const force = new Vector3();

			pursuer.position.set( 0, 0, - 5 );
			pursuer.velocity.set( 0, 1, 0 );

			const evadeBehavior = new EvadeBehavior( pursuer, 5 );

			evadeBehavior.calculate( evader, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

		it( 'should use the predictionFactor to tweak the look ahead time', function () {

			const evader = new Vehicle();
			const pursuer = new Vehicle();
			const force = new Vector3();

			pursuer.position.set( 0, 0, - 5 );
			pursuer.velocity.set( 0, 1, 0 );

			const evadeBehavior = new EvadeBehavior( pursuer, 10, 2 );

			evadeBehavior.calculate( evader, force );

			expect( force.x ).to.closeTo( 0, Number.EPSILON );
			expect( force.y ).to.closeTo( - 0.7071067811865475, Number.EPSILON );
			expect( force.z ).to.closeTo( 0.7071067811865475, Number.EPSILON );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const evadeBehavior = new EvadeBehavior( null, 1, 2 );
			const json = evadeBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.EvadeBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const evadeBehavior1 = new EvadeBehavior( null, 1, 2 );
			const evadeBehavior2 = new EvadeBehavior().fromJSON( SteeringJSONs.EvadeBehavior );

			expect( evadeBehavior1 ).to.deep.equal( evadeBehavior2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new Vehicle();
			const behavior1 = new EvadeBehavior( entity1 );
			const behavior2 = new EvadeBehavior( );

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			behavior2.pursuer = entity1.uuid;

			const map = new Map();
			map.set( entity1.uuid, entity1 );

			behavior2.resolveReferences( map );

			expect( behavior2 ).to.deep.equal( behavior1 );

		} );

		it( 'should set the pursuer to null if the mapping is missing', function () {

			const behavior = new EvadeBehavior();
			behavior.pursuer = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			behavior.resolveReferences( new Map() );

			expect( behavior.pursuer ).to.be.null;

		} );

	} );

} );
