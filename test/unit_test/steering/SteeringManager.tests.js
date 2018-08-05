/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const SteeringManager = YUKA.SteeringManager;
const SteeringBehavior = YUKA.SteeringBehavior;
const Vector3 = YUKA.Vector3;

describe( 'SteeringManager', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const steeringManager = new SteeringManager();
			expect( steeringManager ).to.have.a.property( 'vehicle' ).that.is.undefined;
			expect( steeringManager ).to.have.a.property( 'behaviors' ).that.is.an( 'array' ).and.empty;
			expect( steeringManager ).to.have.a.property( '_steeringForce' ).that.is.an.instanceof( Vector3 );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add a steering behavior to the internal array', function () {

			const steeringManager = new SteeringManager();
			const steeringBehavior = new SteeringBehavior();

			steeringManager.add( steeringBehavior );
			expect( steeringManager.behaviors[ 0 ] ).is.equal( steeringBehavior );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove a steering behavior from the internal array', function () {

			const steeringManager = new SteeringManager();
			const steeringBehavior = new SteeringBehavior();

			steeringManager.add( steeringBehavior );
			steeringManager.remove( steeringBehavior );
			expect( steeringManager.behaviors ).is.empty;

		} );

	} );

} );
