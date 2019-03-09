/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );

const OnPathBehavior = YUKA.OnPathBehavior;
const SeekBehavior = YUKA.SeekBehavior;
const Path = YUKA.Path;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'FollowPathBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const onPathBehavior = new OnPathBehavior();
			expect( onPathBehavior ).to.have.a.property( 'path' ).that.is.an.instanceof( Path );
			expect( onPathBehavior ).to.have.a.property( 'radius' ).that.is.equal( 0.1 );
			expect( onPathBehavior ).to.have.a.property( 'predictionFactor' ).that.is.equal( 1 );
			expect( onPathBehavior ).to.have.a.property( '_seek' ).that.is.an.instanceof( SeekBehavior );

		} );

		it( 'should apply the parameters to the new object', function () {

			const path = new Path();
			const onPathBehavior = new OnPathBehavior( path, 1, 2 );
			expect( onPathBehavior.path ).to.equal( path );
			expect( onPathBehavior.radius ).to.equal( 1 );
			expect( onPathBehavior.predictionFactor ).to.equal( 2 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should produce a force if the vehicle is outside the path radius so the vehicle gets back into the valid range', function () {

			const path = new Path();
			path.add( new Vector3( 0, 0, 0 ) );
			path.add( new Vector3( 0, 0, 10 ) );
			path.add( new Vector3( 10, 0, 10 ) );

			const onPathBehavior = new OnPathBehavior( path, 1 );

			const vehicle = new Vehicle();
			vehicle.velocity.set( 2, 0, 1 );
			const force = new Vector3();

			onPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: - 2, y: 0, z: 0 } );

		} );

		it( 'should produce no force if the vehicle is inside the path radius', function () {

			const path = new Path();
			path.add( new Vector3( 0, 0, 0 ) );
			path.add( new Vector3( 0, 0, 10 ) );
			path.add( new Vector3( 10, 0, 10 ) );

			const onPathBehavior = new OnPathBehavior( path, 1 );

			const vehicle = new Vehicle();
			vehicle.velocity.set( 0, 0, 1 );
			const force = new Vector3();

			onPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

		it( 'should respect the last segment of a looped path', function () {

			const path = new Path();
			path.loop = true;
			path.add( new Vector3( 0, 0, 0 ) );
			path.add( new Vector3( 0, 0, 10 ) );
			path.add( new Vector3( 10, 0, 10 ) );

			const onPathBehavior = new OnPathBehavior( path, 1 );

			const vehicle = new Vehicle();

			// the vehicle is on the last line segment and moves along it

			vehicle.position.set( 5, 0, 5 );
			vehicle.velocity.set( - 1, 0, - 1 );
			const force = new Vector3();

			onPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

		it( 'should produce no force if the path is empty or has just a single waypoint', function () {

			const path = new Path();

			const onPathBehavior = new OnPathBehavior( path, 1 );

			const vehicle = new Vehicle();
			vehicle.velocity.set( 2, 0, 1 );
			const force = new Vector3();

			onPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

			path.add( new Vector3( 0, 0, 0 ) );
			onPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 0 } );

			// add additional point should trigger a force again

			path.add( new Vector3( 0, 0, 10 ) );
			onPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: - 2, y: 0, z: 0 } );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const path = new Path();
			const onPathBehavior = new OnPathBehavior( path, 1, 2 );
			const json = onPathBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.OnPathBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const path = new Path();
			const onPathBehavior1 = new OnPathBehavior( path, 1, 2 );
			const onPathBehavior2 = new OnPathBehavior().fromJSON( SteeringJSONs.OnPathBehavior );

			expect( onPathBehavior1 ).to.deep.equal( onPathBehavior2 );

		} );

	} );

} );
