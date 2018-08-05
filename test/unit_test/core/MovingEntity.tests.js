/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const MovingEntity = YUKA.MovingEntity;
const Vector3 = YUKA.Vector3;

describe( 'MovingEntity', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const movingEntity = new MovingEntity();
			expect( movingEntity ).to.have.a.property( 'velocity' ).that.is.an.instanceof( Vector3 );
			expect( movingEntity ).to.have.a.property( 'maxSpeed' ).that.is.equal( 1 );
			expect( movingEntity ).to.have.a.property( 'updateOrientation' ).that.is.true;

		} );

	} );

	describe( '#getSpeed()', function () {

		it( 'should return the speed value of the internal velocity vector', function () {

			const movingEntity = new MovingEntity();
			movingEntity.velocity.set( 2, 2, 1 );
			expect( movingEntity.getSpeed() ).to.equal( 3 );

		} );

	} );

	describe( '#getSpeed()', function () {

		it( 'should return the speed value in squared space of the internal velocity vector', function () {

			const movingEntity = new MovingEntity();
			movingEntity.velocity.set( 2, 2, 1 );
			expect( movingEntity.getSpeedSquared() ).to.equal( 9 );

		} );

	} );

} );
