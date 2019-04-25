/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const MathJSONs = require( '../../files/MathJSONs.js' );

const BoundingSphere = YUKA.BoundingSphere;
const OBB = YUKA.OBB;
const Matrix3 = YUKA.Matrix3;
const Vector3 = YUKA.Vector3;

const points = [
	new Vector3( 1, 1, 1 ),
	new Vector3( 4, - 1, 4 ),
	new Vector3( 3, 6, - 3 ),
	new Vector3( - 7, - 5, 0 ),
	new Vector3( 2, 9, 19 ),
	new Vector3( 7, 4, 8 ),
	new Vector3( 14, - 14, 2 ),
	new Vector3( - 9, 1, 11 ),
	new Vector3( 0, 14, - 8 )
];

describe( 'OBB', function () {

	const obb = new OBB().fromPoints( points );

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const obb = new OBB();
			expect( obb.center ).to.be.an.instanceof( Vector3 );
			expect( obb.halfSizes ).to.be.an.instanceof( Vector3 );
			expect( obb.rotation ).to.be.an.instanceof( Matrix3 );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const center = new Vector3();
			const halfSizes = new Vector3();
			const rotation = new Matrix3();

			const obb = new OBB( center, halfSizes, rotation );

			expect( obb.center ).to.equal( center );
			expect( obb.halfSizes ).to.equal( halfSizes );
			expect( obb.rotation ).to.equal( rotation );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const center = new Vector3();
			const halfSizes = new Vector3();
			const rotation = new Matrix3();

			const obb = new OBB().set( center, halfSizes, rotation );

			expect( obb.center ).to.equal( center );
			expect( obb.halfSizes ).to.equal( halfSizes );
			expect( obb.rotation ).to.equal( rotation );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const center = new Vector3( 1, 1, 1 );
			const halfSizes = new Vector3( 2, 2, 2 );
			const rotation = new Matrix3().set( 2, 2, 2, 2, 2, 2, 2, 2, 2 );

			const obb1 = new OBB( center, halfSizes, rotation );
			const obb2 = new OBB();

			obb2.copy( obb1 );

			expect( obb2.center ).to.deep.equal( obb1.center );
			expect( obb2.halfSizes ).to.deep.equal( obb1.halfSizes );
			expect( obb2.rotation ).to.deep.equal( obb1.rotation );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const obb1 = new OBB();
			const obb2 = obb1.clone();

			expect( obb1 ).not.to.equal( obb2 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const center = new Vector3( 1, 1, 1 );
			const halfSizes = new Vector3( 2, 2, 2 );
			const rotation = new Matrix3().set( 2, 2, 2, 2, 2, 2, 2, 2, 2 );

			const obb1 = new OBB( center, halfSizes, rotation );
			const obb2 = obb1.clone();

			expect( obb2.center ).to.deep.equal( obb1.center );
			expect( obb2.halfSizes ).to.deep.equal( obb1.halfSizes );
			expect( obb2.rotation ).to.deep.equal( obb1.rotation );

		} );

	} );

	describe( '#fromPoints()', function () {

		it( 'should compute an OBB that encloses the given set of points', function () {

			expect( obb.center.x ).to.closeTo( 1.4303259083418032, Number.EPSILON );
			expect( obb.center.y ).to.closeTo( - 1.104128632659159, Number.EPSILON );
			expect( obb.center.z ).to.closeTo( 5.5, Number.EPSILON );

			expect( obb.halfSizes.x ).to.closeTo( 9.822066640735105, Number.EPSILON );
			expect( obb.halfSizes.y ).to.closeTo( 15.09394620364288, Number.EPSILON );
			expect( obb.halfSizes.z ).to.closeTo( 13.5, Number.EPSILON );

			expect( obb.rotation.elements[ 0 ] ).to.closeTo( - 0.9809113909027889, Number.EPSILON );
			expect( obb.rotation.elements[ 1 ] ).to.closeTo( - 0.1944552472862623, Number.EPSILON );
			expect( obb.rotation.elements[ 2 ] ).to.closeTo( 0, Number.EPSILON );
			expect( obb.rotation.elements[ 3 ] ).to.closeTo( 0.1944552472862623, Number.EPSILON );
			expect( obb.rotation.elements[ 4 ] ).to.closeTo( - 0.9809113909027889, Number.EPSILON );
			expect( obb.rotation.elements[ 5 ] ).to.closeTo( 0, Number.EPSILON );
			expect( obb.rotation.elements[ 6 ] ).to.closeTo( 0, Number.EPSILON );
			expect( obb.rotation.elements[ 7 ] ).to.closeTo( 0, Number.EPSILON );
			expect( obb.rotation.elements[ 8 ] ).to.closeTo( 1, Number.EPSILON );

		} );

	} );

	describe( '#clampPoint()', function () {

		it( 'should ensure the given point is inside this OBB and stores the result in the given vector', function () {

			const closestPoint = new Vector3();

			const point1 = new Vector3();
			const point2 = new Vector3( 0, 20, 0 );
			const point3 = new Vector3( 14, - 14, 2 );

			obb.clampPoint( point1, closestPoint ); // point inside
			expect( closestPoint.x ).to.closeTo( - 7.438494264988549e-15, Number.EPSILON );
			expect( closestPoint.y ).to.closeTo( 5.995204332975845e-15, Number.EPSILON );
			expect( closestPoint.z ).to.closeTo( 0, Number.EPSILON );

			obb.clampPoint( point2, closestPoint ); // point outside
			expect( closestPoint.x ).to.closeTo( 1.144460202503474, Number.EPSILON );
			expect( closestPoint.y ).to.closeTo( 14.22687705918304, Number.EPSILON );
			expect( closestPoint.z ).to.closeTo( 0, Number.EPSILON );

			obb.clampPoint( point3, closestPoint ); // point on OBB
			expect( closestPoint.x ).to.closeTo( 14.000000000000068, Number.EPSILON );
			expect( closestPoint.y ).to.closeTo( - 14.00000000000007, Number.EPSILON );
			expect( closestPoint.z ).to.closeTo( 2, Number.EPSILON );

		} );

	} );

	describe( '#containsPoint()', function () {

		it( 'should return true if the given point is inside this OBB', function () {

			const point1 = new Vector3();
			const point2 = new Vector3( 0, 20, 0 );
			const point3 = new Vector3( 14, - 14, 2 );

			expect( obb.containsPoint( point1 ) ).to.be.true; // point inside
			expect( obb.containsPoint( point2 ) ).to.be.false; // point outside
			expect( obb.containsPoint( point3 ) ).to.be.true; // point on OBB

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if the given bounding sphere intersects this OBB', function () {

			const sphere1 = new BoundingSphere( new Vector3(), 5 );
			const sphere2 = new BoundingSphere( new Vector3(), 50 );
			const sphere3 = new BoundingSphere( new Vector3( 0, 20, 0 ), 1 );
			const sphere4 = new BoundingSphere( new Vector3( 0, 20, 0 ), 10 );

			expect( obb.intersectsBoundingSphere( sphere1 ) ).to.be.true; // sphere fully contained OBB
			expect( obb.intersectsBoundingSphere( sphere2 ) ).to.be.true; // OBB fully contained in sphere
			expect( obb.intersectsBoundingSphere( sphere3 ) ).to.be.false; // no intersection
			expect( obb.intersectsBoundingSphere( sphere4 ) ).to.be.true; // intersection

		} );

	} );

	describe( '#equals()', function () {

		it( 'should execute a deep comparison between two objects', function () {

			const center = new Vector3( 1, 1, 1 );
			const halfSizes = new Vector3( 2, 2, 2 );
			const rotation = new Matrix3().set( 2, 2, 2, 2, 2, 2, 2, 2, 2 );

			const obb1 = new OBB( center, halfSizes, rotation );
			const obb2 = new OBB( new Vector3( 1, 1, 1 ), halfSizes, rotation );
			const obb3 = new OBB( new Vector3( 1, 0, 1 ), halfSizes, rotation );

			expect( obb1.equals( obb2 ) ).to.be.true;
			expect( obb1.equals( obb3 ) ).to.be.false;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const obb = new OBB();
			const json = obb.toJSON();

			expect( json ).to.be.deep.equal( MathJSONs.OBB );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const obb1 = new OBB();
			const obb2 = new OBB( new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ) ).fromJSON( MathJSONs.OBB );

			expect( obb1 ).to.be.deep.equal( obb2 );

		} );

	} );

} );
