/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const SteeringManager = YUKA.SteeringManager;
const SteeringBehavior = YUKA.SteeringBehavior;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

let count = 0;

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
			expect( steeringManager.behaviors[ 0 ] ).to.equal( steeringBehavior );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove a steering behavior from the internal array', function () {

			const steeringManager = new SteeringManager();
			const steeringBehavior = new SteeringBehavior();

			steeringManager.add( steeringBehavior );
			steeringManager.remove( steeringBehavior );
			expect( steeringManager.behaviors ).to.be.empty;

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should calculate the steering force for the internal vehicle', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			const force = new Vector3();
			steeringManager.calculate( 1, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 60 } );

		} );

		it( 'should use the time delta value for force calculation', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 0.5 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 30 } );

		} );

	} );

	describe( '#_accumulate()', function () {

		it( 'should add a force to the main steering force vector', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const force = new Vector3( 0, 0, 50 );

			expect( steeringManager._accumulate( force ) ).to.be.true;
			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 50 } );

		} );

		it( 'should add a force to the main steering force vector without exceeding the maximum force of the vehicle ', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const force = new Vector3( 0, 0, 200 );

			expect( steeringManager._accumulate( force ) ).to.be.true;
			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 100 } );

			expect( steeringManager._accumulate( force ) ).to.be.false;
			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 100 } );

		} );

	} );

	describe( '#_calculateByOrder()', function () {

		it( 'should process the internal steering behaviors according to their internal order and accumulate their force', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			count = 0; // module scope variable
			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 60 } );
			expect( steeringBehavior1.order ).to.equal( 0 );
			expect( steeringBehavior2.order ).to.equal( 1 );

		} );

		it( 'should use the weight property of a steering behavior for force calculation', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringBehavior1.weigth = 2; // this will double the steering force for this behavior
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 70 } );

		} );

		it( 'should perform an early out if the maximum force of the vehicle is reached', function () {

			const vehicle = new Vehicle();
			vehicle.maxForce = 5;
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 5 } );

		} );

		it( 'should ignore inactive steering behaviors', function () {

			const vehicle = new Vehicle();
			const steeringManager = new SteeringManager( vehicle );

			const steeringBehavior1 = new CustomSteeringBehavior1();
			steeringManager.add( steeringBehavior1 );

			const steeringBehavior2 = new CustomSteeringBehavior2();
			steeringBehavior2.active = false;
			steeringManager.add( steeringBehavior2 );

			steeringManager._calculateByOrder( 1 );

			expect( steeringManager._steeringForce ).to.deep.equal( { x: 0, y: 0, z: 10 } );

		} );

	} );

} );

//

class CustomSteeringBehavior1 extends SteeringBehavior {

	constructor() {

		super();

		this.order = 0;

	}

	calculate( vehicle, force, delta ) {

		this.order = count ++;
		force.set( 0, 0, 10 ).multiplyScalar( delta );

	}

}

class CustomSteeringBehavior2 extends SteeringBehavior {

	constructor() {

		super();

		this.order = 0;

	}

	calculate( vehicle, force, delta ) {

		this.order = count ++;
		force.set( 0, 0, 50 ).multiplyScalar( delta );

	}

}
