/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

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

} );
