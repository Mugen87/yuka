/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const SteeringJSONs = require( '../../../files/SteeringJSONs.js' );


const FollowPathBehavior = YUKA.FollowPathBehavior;
const ArriveBehavior = YUKA.ArriveBehavior;
const SeekBehavior = YUKA.SeekBehavior;
const Path = YUKA.Path;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

describe( 'FollowPathBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const followPathBehavior = new FollowPathBehavior();
			expect( followPathBehavior ).to.have.a.property( 'path' ).that.is.an.instanceof( Path );
			expect( followPathBehavior ).to.have.a.property( 'nextWaypointDistance' ).that.is.equal( 1 );
			expect( followPathBehavior ).to.have.a.property( '_arrive' ).that.is.an.instanceof( ArriveBehavior );
			expect( followPathBehavior ).to.have.a.property( '_seek' ).that.is.an.instanceof( SeekBehavior );

		} );

		it( 'should apply the parameters to the new object', function () {

			const path = new Path();
			const followPathBehavior = new FollowPathBehavior( path, 2 );
			expect( followPathBehavior.path ).to.equal( path );
			expect( followPathBehavior.nextWaypointDistance ).to.equal( 2 );

		} );

	} );

	describe( '#calculate()', function () {

		it( 'should seek to the current waypoint of the given path', function () {

			const path = new Path();
			path.add( new Vector3( 0, 0, 10 ) );
			path.add( new Vector3( 0, 10, 10 ) );
			path.add( new Vector3( 0, 10, 0 ) );
			path.add( new Vector3( 0, 1, 0 ) );

			const followPathBehavior = new FollowPathBehavior( path );

			const vehicle = new Vehicle();
			const force = new Vector3();

			followPathBehavior.calculate( vehicle, force );

			expect( force ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should seek to the next waypoint if the vehicle is close enough to the current waypoint', function () {

			const path = new Path();
			path.add( new Vector3( 0, 0, 10 ) );
			path.add( new Vector3( 0, 10, 10 ) );
			path.add( new Vector3( 0, 10, 0 ) );
			path.add( new Vector3( 0, 1, 0 ) );

			const followPathBehavior = new FollowPathBehavior( path );

			const vehicle = new Vehicle();
			vehicle.position.set( 0, 0, 9.5 );
			const force = new Vector3();

			followPathBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 0, 0.01 );
			expect( force.y ).to.closeTo( 1, 0.01 );
			expect( force.z ).to.closeTo( 0.05, 0.01 );

		} );

		it( 'should arrive at the last waypoint (when path is finished)', function () {

			const path = new Path();
			path.add( new Vector3( 0, 0, 10 ) );
			path.add( new Vector3( 0, 10, 10 ) );
			path.add( new Vector3( 0, 10, 0 ) );
			path.add( new Vector3( 0, 1, 0 ) );

			path.advance();
			path.advance();
			path.advance();

			const followPathBehavior = new FollowPathBehavior( path );

			const vehicle = new Vehicle();
			const force = new Vector3();

			followPathBehavior.calculate( vehicle, force );

			expect( force.x ).to.closeTo( 0, 0 );
			expect( force.y ).to.closeTo( 0.33, 0.01 );
			expect( force.z ).to.closeTo( 0, 0 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const path = new Path();
			const followPathBehavior = new FollowPathBehavior( path, 2 );
			const json = followPathBehavior.toJSON();

			expect( json ).to.deep.equal( SteeringJSONs.FollowPathBehavior );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const path = new Path();
			const followPathBehavior1 = new FollowPathBehavior( path, 2 );
			const followPathBehavior2 = new FollowPathBehavior().fromJSON( SteeringJSONs.FollowPathBehavior );

			expect( followPathBehavior1 ).to.deep.equal( followPathBehavior2 );

		} );

	} );

} );
