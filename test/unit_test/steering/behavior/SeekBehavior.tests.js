/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const SeekBehavior = YUKA.SeekBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'SeekBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const seekBehavior = new SeekBehavior();
			expect( seekBehavior ).to.have.a.property( 'target' ).that.is.an.instanceof( Vector3 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const target = new Vector3( 0, 0, 10 );
			const seekBehavior = new SeekBehavior( target );
			expect( seekBehavior.target ).to.deep.equal( { x: 0, y: 0, z: 10 } );


		} );

	} );

	describe( '#calculate()', function () {

		it( 'should seek to the given target position', function () {

			const target = new Vector3( 0, 0, 10 );
			const vehicle = new Vehicle();
			const force = new Vector3();

			const seekBehavior = new SeekBehavior( target );

			seekBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should respect the current velocity of the vehicle', function () {

			const target = new Vector3( 0, 0, 10 );
			const vehicle = new Vehicle();
			vehicle.velocity.set( 0, 1, 0 );
			const force = new Vector3();

			const seekBehavior = new SeekBehavior( target );

			seekBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: - 1, z: 1 } );

		} );

		it( 'should use the maxSpeed property of the vehicle in order to calculate the desired velocity', function () {

			const target = new Vector3( 0, 0, 10 );
			const vehicle = new Vehicle();
			vehicle.maxSpeed = 2;
			const force = new Vector3();

			const seekBehavior = new SeekBehavior( target );

			seekBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 2 } );

		} );

	} );

} );
