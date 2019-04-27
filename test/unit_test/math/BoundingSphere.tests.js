/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const MathJSONs = require( '../../files/MathJSONs.js' );

const BoundingSphere = YUKA.BoundingSphere;
const Plane = YUKA.Plane;
const Matrix4 = YUKA.Matrix4;
const Vector3 = YUKA.Vector3;

const zero3 = new Vector3( 0, 0, 0 );
const one3 = new Vector3( 1, 1, 1 );
const two3 = new Vector3( 2, 2, 2 );

describe( 'BoundingSphere', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const sphere = new BoundingSphere();
			expect( sphere.center ).to.deep.equal( zero3 );
			expect( sphere.radius ).to.equal( 0 );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const sphere = new BoundingSphere( one3, 1 );
			expect( sphere.center ).to.deep.equal( one3 );
			expect( sphere.radius ).to.equal( 1 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const sphere = new BoundingSphere();
			sphere.set( one3, 1 );
			expect( sphere.center ).to.deep.equal( one3 );
			expect( sphere.radius ).to.equal( 1 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = new BoundingSphere();

			sphere2.copy( sphere1 );

			expect( sphere1.center ).to.deep.equal( sphere2.center );
			expect( sphere1.radius ).to.equal( sphere2.radius );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = sphere1.clone();

			expect( sphere1 ).not.to.equal( sphere2 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = sphere1.clone();

			expect( sphere1.center ).to.deep.equal( sphere2.center );
			expect( sphere1.radius ).to.equal( sphere2.radius );

		} );

	} );

	describe( '#clampPoint()', function () {

		it( 'should clamp a point so it does not exceed the boundaries of the bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 1 );

			const point1 = new Vector3( 2, 0, 0 ); // outside
			const point2 = new Vector3( 1, 0, 0 ); // touch
			const point3 = new Vector3( 0.5, 0, 0 ); // inside

			const result = new Vector3();

			expect( sphere.clampPoint( point1, result ) ).to.deep.equal( { x: 1, y: 0, z: 0 } );
			expect( sphere.clampPoint( point2, result ) ).to.deep.equal( { x: 1, y: 0, z: 0 } );
			expect( sphere.clampPoint( point3, result ) ).to.deep.equal( { x: 0.5, y: 0, z: 0 } );

		} );

	} );

	describe( '#containsPoint()', function () {

		it( 'should return true if a point is inside the bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 2 );
			const point = new Vector3( 1, 0, 0 );

			expect( sphere.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return true if a point is exactly on the bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 2 );
			const point = new Vector3( 2, 0, 0 );

			expect( sphere.containsPoint( point ) ).to.be.true;

		} );

		it( 'should return false if a point is outside bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 2 );
			const point = new Vector3( 3, 0, 0 );

			expect( sphere.containsPoint( point ) ).to.be.false;

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if two bounding spheres intersect', function () {

			const sphere1 = new BoundingSphere( zero3, 1 );
			const sphere2 = new BoundingSphere( new Vector3( 0, 1, 0 ), 1 );

			expect( sphere1.intersectsBoundingSphere( sphere2 ) ).to.be.true;

		} );

		it( 'should return true if two bounding spheres touch each other', function () {

			const sphere1 = new BoundingSphere( zero3, 1 );
			const sphere2 = new BoundingSphere( new Vector3( 0, 2, 0 ), 1 );

			expect( sphere1.intersectsBoundingSphere( sphere2 ) ).to.be.true;

		} );

		it( 'should return false if two bounding spheres do not intersect', function () {

			const sphere1 = new BoundingSphere( zero3, 1 );
			const sphere2 = new BoundingSphere( two3, 1 );

			expect( sphere1.intersectsBoundingSphere( sphere2 ) ).to.be.false;

		} );

	} );

	describe( '#intersectsPlane()', function () {

		it( 'should return true if the given plane intersects this bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 1 );
			const plane = new Plane( new Vector3( 0, 1, 0 ), - 0.5 );

			expect( sphere.intersectsPlane( plane ) ).to.be.true;

		} );

		it( 'should return true if the given plane and the bounding sphere touch each other', function () {

			const sphere = new BoundingSphere( zero3, 1 );
			const plane = new Plane( new Vector3( 0, 1, 0 ), - 1 );

			expect( sphere.intersectsPlane( plane ) ).to.be.true;

		} );

		it( 'should return false if the given plane does not intersect this bounding sphere', function () {

			const sphere = new BoundingSphere( zero3, 1 );
			const plane = new Plane( new Vector3( 0, 1, 0 ), - 2 );

			expect( sphere.intersectsPlane( plane ) ).to.be.false;

		} );

	} );

	describe( '#getNormalFromSurfacePoint()', function () {

		it( 'should return the normal for a given point on this bounding sphere its surface', function () {

			const sphere = new BoundingSphere( one3, 1 );
			const surfacePoint = new Vector3( 2, 1, 1 );
			const normal = new Vector3();

			expect( sphere.getNormalFromSurfacePoint( surfacePoint, normal ) ).to.deep.equal( new Vector3( 1, 0, 0 ) );

		} );

	} );

	describe( '#fromPoints()', function () {

		it( 'should compute a bounding sphere that encloses the given set of points', function () {

			const points = [ new Vector3( 1, 1, 1 ), new Vector3( - 2, 2, - 2 ) ];
			const sphere = new BoundingSphere().fromPoints( points );

			expect( sphere.center ).to.deep.equal( new Vector3( - 0.5, 1.5, - 0.5 ) );
			expect( sphere.radius ).to.closeTo( 2.179449471770337, Number.EPSILON );

			expect( sphere.containsPoint( points[ 0 ] ) ).to.be.true;
			expect( sphere.containsPoint( points[ 1 ] ) ).to.be.true;

		} );

	} );

	describe( '#applyMatrix4()', function () {

		it( 'should transform this bounding sphere by the given 4x4 transformation matrix', function () {

			const boundingSphere = new BoundingSphere( zero3, 1 );
			const position = new Vector3( 0, 0, 1 );

			const m = new Matrix4().setPosition( position ).scale( two3 );

			boundingSphere.applyMatrix4( m );

			expect( boundingSphere.center ).to.deep.equal( new Vector3( 0, 0, 1 ) );
			expect( boundingSphere.radius ).to.equal( 2 );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should execute a deep comparison between two objects', function () {

			const sphere1 = new BoundingSphere( one3, 1 );
			const sphere2 = new BoundingSphere( new Vector3( 1, 1, 1 ), 1 );
			const sphere3 = new BoundingSphere( two3, 3 );

			expect( sphere1.equals( sphere2 ) ).to.be.true;
			expect( sphere1.equals( sphere3 ) ).to.be.false;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const boundingSphere = new BoundingSphere();


			expect( boundingSphere.toJSON() ).to.be.deep.equal( MathJSONs.BoundingSphere );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const boundingSphere = new BoundingSphere();
			const boundingSphere2 = new BoundingSphere( new Vector3( 0, 0, 1 ), 1 ).fromJSON( MathJSONs.BoundingSphere );

			expect( boundingSphere2 ).to.be.deep.equal( boundingSphere );

		} );

	} );

} );
