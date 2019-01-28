/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Path = YUKA.Path;
const Vector3 = YUKA.Vector3;
const SteeringJSONs = require( '../../files/SteeringJSONs.js' );

describe( 'Path', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const path = new Path();
			expect( path ).to.have.a.property( 'loop' ).that.is.false;
			expect( path ).to.have.a.property( '_waypoints' ).that.is.an.instanceof( Array );
			expect( path ).to.have.a.property( '_index' ).that.is.equal( 0 );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add a waypoint to the internal array', function () {

			const path = new Path();
			const waypoint = new Vector3();

			path.add( waypoint );

			expect( path._waypoints[ 0 ] ).to.equal( waypoint );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should remove all waypoints from the internal array and reset the current waypoint index', function () {

			const path = new Path();

			path.add( new Vector3() );
			path.add( new Vector3() );
			path.clear();

			expect( path._waypoints ).to.be.empty;
			expect( path._index ).to.equal( 0 );

		} );

	} );

	describe( '#current()', function () {

		it( 'should return the current waypoint of the path defined by the internal index property', function () {

			const path = new Path();
			const waypoint1 = new Vector3();
			const waypoint2 = new Vector3();
			const waypoint3 = new Vector3();

			path.add( waypoint1 );
			path.add( waypoint2 );
			path.add( waypoint3 );

			path._index = 1;

			expect( path.current() ).to.equal( waypoint2 );

		} );

	} );

	describe( '#finished()', function () {

		it( 'should return true if the last waypoint is reached', function () {

			const path = new Path();

			path.add( new Vector3() );
			path.add( new Vector3() );
			path.add( new Vector3() );

			path._index = 2;

			expect( path.finished() ).to.be.true;

		} );

		it( 'should return false if the last waypoint is reached but the path cyclic (loop = true)', function () {

			const path = new Path();
			path.loop = true;

			path.add( new Vector3() );
			path.add( new Vector3() );
			path.add( new Vector3() );

			path._index = 2;

			expect( path.finished() ).to.be.false;

		} );

	} );

	describe( '#advance()', function () {

		it( 'should return the correct waypoint when advancing in a path', function () {

			const path = new Path();
			const waypoint1 = new Vector3();
			const waypoint2 = new Vector3();
			const waypoint3 = new Vector3();

			path.add( waypoint1 );
			path.add( waypoint2 );
			path.add( waypoint3 );

			expect( path.current() ).to.equal( waypoint1 );
			path.advance();
			expect( path.current() ).to.equal( waypoint2 );
			path.advance();
			expect( path.current() ).to.equal( waypoint3 );

		} );

		it( 'should return the same waypoint if the end of the path is reached', function () {

			const path = new Path();
			const waypoint1 = new Vector3();
			const waypoint2 = new Vector3();

			path.add( waypoint1 );
			path.add( waypoint2 );

			expect( path.current() ).to.equal( waypoint1 );
			path.advance();
			expect( path.current() ).to.equal( waypoint2 );
			path.advance();
			expect( path.current() ).to.equal( waypoint2 );

		} );

		it( 'should return waypoints in a cyclic fashion if the path is cyclic (loop = true)', function () {

			const path = new Path();
			path.loop = true;

			const waypoint1 = new Vector3();
			const waypoint2 = new Vector3();

			path.add( waypoint1 );
			path.add( waypoint2 );

			expect( path.current() ).to.equal( waypoint1 );
			path.advance();
			expect( path.current() ).to.equal( waypoint2 );
			path.advance();
			expect( path.current() ).to.equal( waypoint1 );
			path.advance();
			expect( path.current() ).to.equal( waypoint2 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const path = new Path();
			const waypoint = new Vector3();

			path.add( waypoint );

			expect( path.toJSON() ).to.deep.equal( SteeringJSONs.Path );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {} );

		const path = new Path();
		const path2 = new Path().fromJSON( SteeringJSONs.Path );
		const waypoint = new Vector3();

		path.add( waypoint );

		expect( path2 ).to.deep.equal( path );

	} );

} );
