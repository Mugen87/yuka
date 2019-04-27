/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const MathJSONs = require( '../../files/MathJSONs.js' );

const AABB = YUKA.AABB;
const BoundingSphere = YUKA.BoundingSphere;
const OBB = YUKA.OBB;
const Plane = YUKA.Plane;
const Quaternion = YUKA.Quaternion;
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

	describe( '#getSize()', function () {

		it( 'should return the size of the OBB', function () {

			const center = new Vector3( 1, 1, 1 );
			const halfSizes = new Vector3( 2, 2, 2 );
			const rotation = new Matrix3().set( 2, 2, 2, 2, 2, 2, 2, 2, 2 );

			const obb = new OBB( center, halfSizes, rotation );
			const size = new Vector3();

			obb.getSize( size );

			expect( size ).to.deep.equal( new Vector3( 4, 4, 4 ) );

		} );

	} );

	describe( '#fromAABB()', function () {

		it( 'should computes the OBB from an AABB', function () {

			const aabb = new AABB().fromCenterAndSize( new Vector3( 1, 1, 1 ), new Vector3( 2, 2, 2 ) );
			const obb = new OBB().fromAABB( aabb );

			expect( obb.center ).to.deep.equal( new Vector3( 1, 1, 1 ) );
			expect( obb.halfSizes ).to.deep.equal( new Vector3( 1, 1, 1 ) );
			expect( obb.rotation ).to.deep.equal( new Matrix3() );

		} );

	} );

	describe( '#fromPoints()', function () {

		it( 'should compute an OBB that encloses the given set of points', function () {

			expect( obb.center.x ).to.closeTo( 2.0778426352496924, Number.EPSILON );
			expect( obb.center.y ).to.closeTo( - 4.007474094173611, Number.EPSILON );
			expect( obb.center.z ).to.closeTo( 3.1023614747658463, Number.EPSILON );

			expect( obb.halfSizes.x ).to.closeTo( 8.43764728814747, Number.EPSILON );
			expect( obb.halfSizes.y ).to.closeTo( 14.657724277890626, Number.EPSILON );
			expect( obb.halfSizes.z ).to.closeTo( 13.754912222752461, Number.EPSILON );

			expect( obb.rotation.elements[ 0 ] ).to.closeTo( 0.8634950831013628, Number.EPSILON );
			expect( obb.rotation.elements[ 1 ] ).to.closeTo( 0.5033385631350236, Number.EPSILON );
			expect( obb.rotation.elements[ 2 ] ).to.closeTo( 0.032039543082580876, Number.EPSILON );
			expect( obb.rotation.elements[ 3 ] ).to.closeTo( - 0.50184074522067, Number.EPSILON );
			expect( obb.rotation.elements[ 4 ] ).to.closeTo( 0.8511132886686104, Number.EPSILON );
			expect( obb.rotation.elements[ 5 ] ).to.closeTo( 0.15414939600292202, Number.EPSILON );
			expect( obb.rotation.elements[ 6 ] ).to.closeTo( 0.05032005461178748, Number.EPSILON );
			expect( obb.rotation.elements[ 7 ] ).to.closeTo( - 0.1491859936886602, Number.EPSILON );
			expect( obb.rotation.elements[ 8 ] ).to.closeTo( 0.9875279395495573, Number.EPSILON );

		} );

	} );

	describe( '#clampPoint()', function () {

		it( 'should ensure the given point is inside this OBB and stores the result in the given vector', function () {

			const closestPoint = new Vector3();

			const point1 = new Vector3();
			const point2 = new Vector3( 0, 20, 0 );
			const point3 = new Vector3( 14, - 14, 2 );

			obb.clampPoint( point1, closestPoint ); // point inside
			expect( closestPoint.x ).to.closeTo( - 7.771561172376096e-16, Number.EPSILON );
			expect( closestPoint.y ).to.closeTo( 1.6653345369377348e-15, Number.EPSILON );
			expect( closestPoint.z ).to.closeTo( - 1.3322676295501878e-15, Number.EPSILON );

			obb.clampPoint( point2, closestPoint ); // point outside
			expect( closestPoint.x ).to.closeTo( 1.6682157671156284, Number.EPSILON );
			expect( closestPoint.y ).to.closeTo( 13.721879399308623, Number.EPSILON );
			expect( closestPoint.z ).to.closeTo( - 1.0334415138496267, Number.EPSILON );

			obb.clampPoint( point3, closestPoint ); // point on OBB
			expect( closestPoint.x ).to.closeTo( 14.000000000000005, Number.EPSILON );
			expect( closestPoint.y ).to.closeTo( - 14.000000000000004, Number.EPSILON );
			expect( closestPoint.z ).to.closeTo( 1.9999999999999996, Number.EPSILON );

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

	describe( '#intersectsAABB()', function () {

		it( 'should return true if the given AABB intersects this OBB', function () {

			const aabb1 = new AABB().fromCenterAndSize( new Vector3(), new Vector3( 1, 1, 1 ) );
			const aabb2 = new AABB().fromCenterAndSize( new Vector3(), new Vector3( 50, 50, 50 ) );
			const aabb3 = new AABB().fromCenterAndSize( new Vector3( 0, 20, 0 ), new Vector3( 20, 20, 20 ) );

			expect( obb.intersectsAABB( aabb1 ) ).to.be.true; // AABB fully contained in OBB
			expect( obb.intersectsAABB( aabb2 ) ).to.be.true; // OBB fully contained in AABB
			expect( obb.intersectsAABB( aabb3 ) ).to.be.true; // intersection

		} );

		it( 'should return false if there is no intersection', function () {

			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 20, 0 ), new Vector3( 1, 1, 1 ) );

			expect( obb.intersectsAABB( aabb ) ).to.be.false;

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if the given bounding sphere intersects this OBB', function () {

			const sphere1 = new BoundingSphere( new Vector3(), 5 );
			const sphere2 = new BoundingSphere( new Vector3(), 50 );
			const sphere4 = new BoundingSphere( new Vector3( 0, 20, 0 ), 10 );

			expect( obb.intersectsBoundingSphere( sphere1 ) ).to.be.true; // sphere fully contained in OBB
			expect( obb.intersectsBoundingSphere( sphere2 ) ).to.be.true; // OBB fully contained in sphere
			expect( obb.intersectsBoundingSphere( sphere4 ) ).to.be.true; // intersection

		} );

		it( 'should return false if there is no intersection', function () {

			const sphere = new BoundingSphere( new Vector3( 0, 20, 0 ), 1 );

			expect( obb.intersectsBoundingSphere( sphere ) ).to.be.false;

		} );

	} );

	describe( '#intersectsOBB()', function () {

		it( 'should return true if the given OBB intersects this OBB', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );

			obb2.center.set( 4, 1, 15 );
			obb2.halfSizes.set( 5, 5, 5 );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.true; // interesction

		} );

		it( 'should return true if the given OBB is fully contained in this OBB', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );

			obb2.center.set( 4, 1, 10 );
			obb2.halfSizes.set( 2, 2, 2 );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.true;

		} );

		it( 'should return false if there is no intersection (test A0,A1,A2)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );

			obb2.center.set( 4, 1, - 10 );
			obb2.halfSizes.set( 5, 5, 5 );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test B0,B1,B2)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );
			obb1.rotation.fromQuaternion( new Quaternion().fromEuler( Math.PI * 0.25, 0, 0 ) );

			obb2.center.set( 4, 1, - 10 );
			obb2.halfSizes.set( 10, 10, 10 );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test A2 x B0 and A0 x B2)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );
			obb1.rotation.fromQuaternion( new Quaternion().fromEuler( 0, 0, Math.PI * 0.25 ) );

			obb2.center.set( 4, 20, 10 );
			obb2.halfSizes.set( 8, 8, 8 );
			obb2.rotation.fromQuaternion( new Quaternion().fromEuler( Math.PI * 0.25, 0, 0 ) );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;
			expect( obb2.intersectsOBB( obb1 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test A2 x B1 abd A1 x B2)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );
			obb1.rotation.fromQuaternion( new Quaternion().fromEuler( 0, Math.PI * 0.25, 0 ) );

			obb2.center.set( 20, 1, 8 );
			obb2.halfSizes.set( 5, 5, 5 );
			obb2.rotation.fromQuaternion( new Quaternion().fromEuler( 0, 0, Math.PI * 0.25 ) );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;
			expect( obb2.intersectsOBB( obb1 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test A0 x B1 and A1 x B0)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );
			obb1.rotation.fromQuaternion( new Quaternion().fromEuler( Math.PI * 0.25, 0, 0 ) );

			obb2.center.set( 4, 1, - 8 );
			obb2.halfSizes.set( 5, 5, 5 );
			obb2.rotation.fromQuaternion( new Quaternion().fromEuler( 0, Math.PI * 0.25, 0 ) );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;
			expect( obb2.intersectsOBB( obb1 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test A0 x B0)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );

			obb2.center.set( 4, - 10, 20 );
			obb2.halfSizes.set( 5, 5, 5 );
			obb2.rotation.fromQuaternion( new Quaternion().fromEuler( Math.PI * 0.2, - Math.PI * 0.2, Math.PI * 0.5 ) );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test A1 x B1)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );

			obb2.center.set( - 8, 1, 0 );
			obb2.halfSizes.set( 5, 5, 5 );
			obb2.rotation.fromQuaternion( new Quaternion().fromEuler( Math.PI * 0.2, Math.PI * 0.2, Math.PI * 0.5 ) );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;

		} );

		it( 'should return false if there is no intersection (test A2 x B2)', function () {

			const obb1 = new OBB();
			const obb2 = new OBB();

			obb1.center.set( 4, 1, 10 );
			obb1.halfSizes.set( 5, 5, 5 );

			obb2.center.set( 14, 11, 10 );
			obb2.halfSizes.set( 5, 5, 5 );
			obb2.rotation.fromQuaternion( new Quaternion().fromEuler( - Math.PI * 0.1, - Math.PI * 0.2, 0 ) );

			expect( obb1.intersectsOBB( obb2 ) ).to.be.false;

		} );

	} );

	describe( '#intersectsPlane()', function () {

		it( 'should return true if the given plane intersects this OBB', function () {

			const plane = new Plane( new Vector3( 0, 1, 0 ), 0 );

			expect( obb.intersectsPlane( plane ) ).to.be.true;

		} );

		it( 'should return false if there is no intersection', function () {

			const plane = new Plane( new Vector3( 0, 1, 0 ), 20 );

			expect( obb.intersectsPlane( plane ) ).to.be.false;

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
