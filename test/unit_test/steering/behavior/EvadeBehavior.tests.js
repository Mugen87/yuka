/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

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

} );
