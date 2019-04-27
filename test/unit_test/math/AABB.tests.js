/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const MathJSONs = require( '../../files/MathJSONs.js' );

const AABB = YUKA.AABB;
const BoundingSphere = YUKA.BoundingSphere;
const Plane = YUKA.Plane;
const Matrix4 = YUKA.Matrix4;
const Vector3 = YUKA.Vector3;

const zero3 = new Vector3( 0, 0, 0 );
const one3 = new Vector3( 1, 1, 1 );
const two3 = new Vector3( 2, 2, 2 );

describe( 'AABB', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const aabb = new AABB();
			expect( aabb.min ).to.deep.equal( new Vector3() );
			expect( aabb.max ).to.deep.equal( new Vector3() );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const aabb = new AABB( one3, two3 );
			expect( aabb.min ).to.deep.equal( one3 );
			expect( aabb.max ).to.deep.equal( two3 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const aabb = new AABB();
			aabb.set( one3, two3 );
			expect( aabb.min ).to.deep.equal( one3 );
			expect( aabb.max ).to.deep.equal( two3 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = new AABB();

			aabb2.copy( aabb1 );

			expect( aabb1.min ).to.deep.equal( aabb2.min );
			expect( aabb1.max ).to.deep.equal( aabb2.max );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = aabb1.clone();

			expect( aabb1 ).not.to.equal( aabb2 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = aabb1.clone();

			expect( aabb1.min ).to.deep.equal( aabb2.min );
			expect( aabb1.max ).to.deep.equal( aabb2.max );

		} );

	} );

	describe( '#clampPoint()', function () {

		it( 'should clamp a point so it does not exceed the boundaries of the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, - 4, 2 );
			const result = new Vector3();

			aabb.clampPoint( point, result );

			expect( result ).to.deep.equal( new Vector3( 0.5, 0, 1 ) );

		} );

	} );

	describe( '#containsPoint()', function () {

		it( 'should return true if a point is inside the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, 0.5, 0.5 );

			expect( aabb.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return true if a point is exactly on the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, 0.5, 1 );

			expect( aabb.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return false if a point is outside AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const point = new Vector3( 0.5, 0.5, 2 );

			expect( aabb.containsPoint( point ) ).to.be.false;

		} );

	} );

	describe( '#expand()', function () {

		it( 'should expand the AABB by the given point', function () {

			const aabb = new AABB();
			const point1 = new Vector3( 1, 1, 1 );
			const point2 = new Vector3( - 2, 2, - 2 );

			aabb.min.set( Infinity, Infinity, Infinity );
			aabb.max.set( - Infinity, - Infinity, - Infinity );

			aabb.expand( point1 );
			expect( aabb.min ).to.deep.equal( new Vector3( 1, 1, 1 ) );
			expect( aabb.max ).to.deep.equal( new Vector3( 1, 1, 1 ) );

			aabb.expand( point2 );
			expect( aabb.min ).to.deep.equal( new Vector3( - 2, 1, - 2 ) );
			expect( aabb.max ).to.deep.equal( new Vector3( 1, 2, 1 ) );

		} );

	} );

	describe( '#getCenter()', function () {

		it( 'should compute the center point of this AABB and store it into the given vector', function () {

			const aabb = new AABB( zero3, one3 );
			const center = new Vector3();

			aabb.getCenter( center );

			expect( center ).to.deep.equal( new Vector3( 0.5, 0.5, 0.5 ) );

		} );

	} );

	describe( '#getSize()', function () {

		it( 'should compute the size (width, height, depth) of this AABB and store it into the given vector', function () {

			const aabb = new AABB( one3, two3 );
			const size = new Vector3();

			aabb.getSize( size );

			expect( size ).to.deep.equal( new Vector3( 1, 1, 1 ) );

		} );

	} );

	describe( '#intersectsAABB()', function () {

		it( 'should return true if the given AABB intersects this AABB', function () {

			const aabb1 = new AABB( zero3, one3 );
			const aabb2 = new AABB( new Vector3( 0.5, 0.5, 0.5 ), two3 );

			expect( aabb1.intersectsAABB( aabb2 ) ).to.be.true;

		} );

		it( 'should return true if the given AABB touches this AABB', function () {

			const aabb1 = new AABB( zero3, one3 );
			const aabb2 = new AABB( one3, two3 );

			expect( aabb1.intersectsAABB( aabb2 ) ).to.be.true;

		} );

		it( 'should return false if the given AABB does not intersect this AABB', function () {

			const aabb1 = new AABB( zero3, one3 );
			const aabb2 = new AABB( two3, new Vector3( 3, 3, 3 ) );

			expect( aabb1.intersectsAABB( aabb2 ) ).to.be.false;

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if a bounding sphere intersects the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const sphere = new BoundingSphere( one3, 1 );

			expect( aabb.intersectsBoundingSphere( sphere ) ).to.be.true;

		} );

		it( 'should return true if a bounding sphere touches the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const sphere = new BoundingSphere( new Vector3( 0.5, 0.5, 1.5 ), 0.5 );

			expect( aabb.intersectsBoundingSphere( sphere ) ).to.be.true;

		} );

		it( 'should return false if a bounding sphere does not intersect the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const sphere = new BoundingSphere( new Vector3( 0.5, 0.5, 1.5 ), 0.4 );

			expect( aabb.intersectsBoundingSphere( sphere ) ).to.be.false;

		} );

	} );

	describe( '#intersectsPlane()', function () {

		it( 'should return true if a plane intersects the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const plane = new Plane( new Vector3( 0, 1, 0 ), - 0.5 );

			expect( aabb.intersectsPlane( plane ) ).to.be.true;

		} );

		it( 'should return true if a plane touches the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const plane = new Plane( new Vector3( 0, 1, 0 ), - 1 );

			expect( aabb.intersectsPlane( plane ) ).to.be.true;

		} );

		it( 'should return false if a plane does not intersect the AABB', function () {

			const aabb = new AABB( zero3, one3 );
			const plane = new Plane( new Vector3( 0, 1, 0 ), - 2 );

			expect( aabb.intersectsPlane( plane ) ).to.be.false;

		} );

	} );

	describe( '#getNormalFromSurfacePoint()', function () {

		it( 'should return the normal for a given point on this AABB its surface', function () {

			let aabb = new AABB( zero3, one3 );

			const surfacePoint1 = new Vector3( 1, 0.5, 0.5 );
			const surfacePoint2 = new Vector3( 0, 0.5, 0.5 );
			const surfacePoint3 = new Vector3( 0.5, 1, 0.5 );
			const surfacePoint4 = new Vector3( 0.5, 0, 0.5 );
			const surfacePoint5 = new Vector3( 0.5, 0.5, 1 );
			const surfacePoint6 = new Vector3( 0.5, 0.5, 0 );

			const normal = new Vector3();

			expect( aabb.getNormalFromSurfacePoint( surfacePoint1, normal ) ).to.deep.equal( new Vector3( 1, 0, 0 ) );
			expect( aabb.getNormalFromSurfacePoint( surfacePoint2, normal ) ).to.deep.equal( new Vector3( - 1, 0, 0 ) );
			expect( aabb.getNormalFromSurfacePoint( surfacePoint3, normal ) ).to.deep.equal( new Vector3( 0, 1, 0 ) );
			expect( aabb.getNormalFromSurfacePoint( surfacePoint4, normal ) ).to.deep.equal( new Vector3( 0, - 1, 0 ) );
			expect( aabb.getNormalFromSurfacePoint( surfacePoint5, normal ) ).to.deep.equal( new Vector3( 0, 0, 1 ) );
			expect( aabb.getNormalFromSurfacePoint( surfacePoint6, normal ) ).to.deep.equal( new Vector3( 0, 0, - 1 ) );

			// special case

			aabb = new AABB();
			aabb.min.set( - Infinity, - Infinity, - Infinity );
			aabb.max.set( Infinity, Infinity, Infinity );

			const surfacePoint7 = new Vector3( Infinity, Infinity, Infinity );
			expect( aabb.getNormalFromSurfacePoint( surfacePoint7, normal ) ).to.deep.equal( new Vector3( 0, 0, 0 ) );

		} );

	} );

	describe( '#fromCenterAndSize()', function () {

		it( 'should set the min and max vector of the AABB according to the given parameter', function () {

			const center = new Vector3( 0, 2, 0 );
			const size = new Vector3( 1, 0.5, 1 );
			const aabb = new AABB().fromCenterAndSize( center, size );

			expect( aabb.min ).to.deep.equal( new Vector3( - 0.5, 1.75, - 0.5 ) );
			expect( aabb.max ).to.deep.equal( new Vector3( 0.5, 2.25, 0.5 ) );

		} );

	} );

	describe( '#fromPoints()', function () {

		it( 'should compute an AABB that encloses the given set of points', function () {

			const points = [ new Vector3( 1, 1, 1 ), new Vector3( - 2, 2, - 2 ) ];
			const aabb = new AABB().fromPoints( points );

			expect( aabb.min ).to.deep.equal( new Vector3( - 2, 1, - 2 ) );
			expect( aabb.max ).to.deep.equal( new Vector3( 1, 2, 1 ) );

			expect( aabb.containsPoint( points[ 0 ] ) ).to.be.true;
			expect( aabb.containsPoint( points[ 1 ] ) ).to.be.true;

		} );

	} );

	describe( '#applyMatrix4()', function () {

		it( 'should transform this AABB by the given 4x4 transformation matrix', function () {

			const aabb = new AABB().fromCenterAndSize( zero3, two3 );
			const position = new Vector3( 0, 0, 1 );

			const m = new Matrix4().setPosition( position ).scale( two3 );

			aabb.applyMatrix4( m );

			expect( aabb.min ).to.deep.equal( new Vector3( - 2, - 2, - 1 ) );
			expect( aabb.max ).to.deep.equal( new Vector3( 2, 2, 3 ) );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should execute a deep comparison between two objects', function () {

			const aabb1 = new AABB( one3, two3 );
			const aabb2 = new AABB( new Vector3( 1, 1, 1 ), two3 );
			const aabb3 = new AABB( zero3, one3 );

			expect( aabb1.equals( aabb2 ) ).to.be.true;
			expect( aabb1.equals( aabb3 ) ).to.be.false;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const aabb = new AABB();

			const json = aabb.toJSON();

			expect( json ).to.be.deep.equal( MathJSONs.AABB );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const aabb = new AABB();
			const aabb2 = new AABB( new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ) ).fromJSON( MathJSONs.AABB );

			expect( aabb2 ).to.be.deep.equal( aabb );

		} );

	} );

} );
