/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Ray = YUKA.Ray;
const Matrix4 = YUKA.Matrix4;
const Quaternion = YUKA.Quaternion;
const Vector3 = YUKA.Vector3;
const AABB = YUKA.AABB;
const Plane = YUKA.Plane;
const BoundingSphere = YUKA.BoundingSphere;
const ConvexHull = YUKA.ConvexHull;
const OBB = YUKA.OBB;
const BVH = YUKA.BVH;
const MeshGeometry = YUKA.MeshGeometry;

const v1 = new Vector3( 2, 2, 2 );
const v2 = new Vector3( 0, 0, 1 );

describe( 'Ray', function () {

	describe( '#constructor', function () {

		it( 'should return ray with default parameters', function () {

			const ray = new Ray();
			const v0 = new Vector3();

			expect( ray.origin ).to.deep.equal( v0 );
			expect( ray.direction ).to.deep.equal( v0 );

		} );

		it( 'should return ray with given parameters', function () {

			const ray = new Ray( v1, v2 );

			expect( ray.origin ).to.deep.equal( v1 );
			expect( ray.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set given parameters to ray', function () {

			const ray = new Ray().set( v1, v2 );

			expect( ray.origin ).to.deep.equal( v1 );
			expect( ray.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy a given ray to the current instance', function () {

			const r1 = new Ray( v1, v2 );
			const r2 = new Ray().copy( r1 );

			expect( r2.origin ).to.deep.equal( v1 );
			expect( r2.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of the ray', function () {

			const r1 = new Ray( v1, v2 );
			const r2 = r1.clone();

			expect( r2.origin ).to.deep.equal( v1 );
			expect( r2.direction ).to.deep.equal( v2 );

		} );

	} );

	describe( '#at()', function () {

		it( 'should fill the result vector with a position on the ray based on the given t parameter', function () {

			const ray = new Ray( v1, v2 );
			const t = 10;
			const result = new Vector3();

			ray.at( t, result );

			expect( result ).to.deep.equal( { x: 2, y: 2, z: 12 } );

		} );

	} );

	describe( '#intersectBoundingSphere()', function () {

		it( 'should fill the given result vector with the intersection point of a ray/sphere intersection test', function () {

			const ray = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			ray.intersectBoundingSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 9 } );

		} );

		it( 'should fill the given result vector with the intersection point if the ray touches the sphere', function () {

			const ray = new Ray( new Vector3( 0, 1, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			ray.intersectBoundingSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 1, z: 10 } );

		} );

		it( 'should fill the given result vector with the intersection point if the ray starts inside the sphere', function () {

			const ray = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3(), 1 );
			const result = new Vector3();

			ray.intersectBoundingSphere( sphere, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should return null to indicate no intersection', function () {

			const ray = new Ray( new Vector3( 0, 10, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			expect( ray.intersectBoundingSphere( sphere, result ) ).to.be.null;

		} );

		it( 'should return null to indicate no intersection (ray starts behind sphere)', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = new Vector3();

			expect( ray.intersectBoundingSphere( sphere, result ) ).to.be.null;

		} );

	} );

	describe( '#intersectsBoundingSphere()', function () {

		it( 'should return true if the ray intersects the sphere', function () {

			const ray = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = ray.intersectsBoundingSphere( sphere );

			expect( result ).to.be.true;

		} );

		it( 'should return true if the ray touches the sphere', function () {

			const ray = new Ray( new Vector3( 0, 1, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = ray.intersectsBoundingSphere( sphere );

			expect( result ).to.be.true;

		} );

		it( 'should return true if the ray starts inside the sphere', function () {

			const ray = new Ray( new Vector3(), v2 );
			const sphere = new BoundingSphere( new Vector3(), 1 );
			const result = ray.intersectsBoundingSphere( sphere );

			expect( result ).to.be.true;

		} );

		it( 'should return false to indicate no intersection', function () {

			const ray = new Ray( new Vector3( 0, 10, 0 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = ray.intersectsBoundingSphere( sphere );

			expect( result ).to.be.false;

		} );

		it( 'should return false to indicate no intersection (ray starts behind sphere)', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), v2 );
			const sphere = new BoundingSphere( new Vector3( 0, 0, 10 ), 1 );
			const result = ray.intersectsBoundingSphere( sphere );

			expect( result ).to.be.false;

		} );

	} );

	describe( '#intersectAABB()', function () {

		it( 'should fill the given result vector with the intersection point of a ray/AABB intersection test', function () {

			const ray = new Ray( new Vector3(), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = new Vector3();
			ray.intersectAABB( aabb, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 9 } );

		} );

		it( 'should fill the given result vector with the intersection point of a ray/AABB intersection test, other cases', function () {

			const ray = new Ray( new Vector3(), new Vector3( - 1, 0, - 1 ) );
			const aabb = new AABB().fromCenterAndSize( new Vector3( - 2, 0, - 2 ), new Vector3( 1, 0, - 1 ) );

			const result = new Vector3();
			ray.intersectAABB( aabb, result );

			expect( result ).to.deep.equal( { x: - 2.5, y: 0, z: - 2.5 } );

		} );

		it( 'should fill the given result vector with the intersection point if the ray touches the AABB', function () {

			const ray = new Ray( new Vector3( 1, 0, 0 ), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = new Vector3();
			ray.intersectAABB( aabb, result );

			expect( result ).to.deep.equal( { x: 1, y: 0, z: 9 } );

		} );

		it( 'should fill the given result vector with the intersection point if the ray starts inside the AABB', function () {

			const ray = new Ray( new Vector3( 0, 0, 10 ), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = new Vector3();
			ray.intersectAABB( aabb, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 11 } );

		} );

		it( 'should return null to indicate no intersection', function () {

			const ray1 = new Ray( new Vector3( 0, 0, 15 ), v2 );
			const ray2 = new Ray( new Vector3( 0, - 15, 10 ), v2 );
			const ray3 = new Ray( new Vector3( - 10, 10, 0 ), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = new Vector3();

			expect( ray1.intersectAABB( aabb, result ) ).to.be.null;
			expect( ray2.intersectAABB( aabb, result ) ).to.be.null;
			expect( ray3.intersectAABB( aabb, result ) ).to.be.null;

		} );

	} );

	describe( '#intersectsAABB()', function () {

		it( 'should return true if the ray intersects the AABB', function () {

			const ray = new Ray( new Vector3(), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = ray.intersectsAABB( aabb );
			expect( result ).to.be.true;

		} );

		it( 'should return true if the ray intersects the AABB, other cases', function () {

			const ray = new Ray( new Vector3(), new Vector3( - 1, 0, - 1 ) );
			const aabb = new AABB().fromCenterAndSize( new Vector3( - 2, 0, - 2 ), new Vector3( 1, 0, - 1 ) );

			const result = ray.intersectsAABB( aabb );
			expect( result ).to.be.true;

		} );

		it( 'should return true if the ray touches the AABB', function () {

			const ray = new Ray( new Vector3( 1, 0, 0 ), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = ray.intersectsAABB( aabb );
			expect( result ).to.be.true;

		} );

		it( 'should return true if the ray starts inside the AABB', function () {

			const ray = new Ray( new Vector3( 0, 0, 10 ), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result = ray.intersectsAABB( aabb );
			expect( result ).to.be.true;

		} );

		it( 'should return false to indicate no intersection', function () {

			const ray1 = new Ray( new Vector3( 0, 0, 15 ), v2 );
			const ray2 = new Ray( new Vector3( 0, - 15, 10 ), v2 );
			const ray3 = new Ray( new Vector3( - 10, 10, 0 ), v2 );
			const aabb = new AABB().fromCenterAndSize( new Vector3( 0, 0, 10 ), new Vector3( 2, 2, 2 ) );

			const result1 = ray1.intersectsAABB( aabb );
			const result2 = ray2.intersectsAABB( aabb );
			const result3 = ray3.intersectsAABB( aabb );

			expect( result1 ).to.be.false;
			expect( result2 ).to.be.false;
			expect( result3 ).to.be.false;

		} );

	} );

	describe( '#intersectPlane()', function () {

		it( 'should fill the given result vector with the intersection point of a ray/plane intersection test', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, 1 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = new Vector3();
			ray.intersectPlane( plane, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 2 } );

		} );

		it( 'should detect no intersection if the ray is parallel to the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 1, 0, 0 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = new Vector3();

			expect( ray.intersectPlane( plane, result ) ).to.be.null;

		} );

		it( 'should detect no intersection if the ray is behind the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, - 1 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = new Vector3();

			expect( ray.intersectPlane( plane, result ) ).to.be.null;

		} );

		it( 'should detect no intersection if the ray hits the backside of the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, 1 ) );
			const plane = new Plane( new Vector3( 0, 0, 1 ), 2 );

			const result = new Vector3();

			expect( ray.intersectPlane( plane, result ) ).to.be.null;

		} );

		it( 'should return the origin of the ray if the ray is coplanar to the plane', function () {

			const ray = new Ray( new Vector3( 0, 0, 2 ), new Vector3( 1, 0, 0 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = new Vector3();

			expect( ray.intersectPlane( plane, result ) ).to.deep.equal( ray.origin );

		} );

	} );

	describe( '#intersectsPlane()', function () {

		it( 'should return true if the ray intersects the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, 1 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = ray.intersectsPlane( plane );
			expect( result ).to.be.true;

		} );

		it( 'should return false if the ray is parallel to the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 1, 0, 0 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = ray.intersectsPlane( plane );
			expect( result ).to.be.false;

		} );

		it( 'should return false if the ray is behind the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, - 1 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = ray.intersectsPlane( plane );
			expect( result ).to.be.false;

		} );

		it( 'should return false if the ray hits the backside of the plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, 1 ) );
			const plane = new Plane( new Vector3( 0, 0, 1 ), 2 );

			const result = ray.intersectsPlane( plane );
			expect( result ).to.be.false;

		} );

		it( 'should return true if the ray is coplanar to the plane', function () {

			const ray = new Ray( new Vector3( 0, 0, 2 ), new Vector3( 1, 0, 0 ) );
			const plane = new Plane( new Vector3( 0, 0, - 1 ), 2 );

			const result = ray.intersectsPlane( plane );
			expect( result ).to.be.true;

		} );

	} );

	describe( '#intersectOBB()', function () {

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

		const obb = new OBB().fromPoints( points );

		it( 'should fill the given result vector with the intersection point of a ray/OBB intersection test', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, - 1 ) );
			const result = new Vector3();

			ray.intersectOBB( obb, result );

			expect( result.x ).to.closeTo( 0, Number.EPSILON );
			expect( result.y ).to.closeTo( 8.881784197001252e-16, Number.EPSILON );
			expect( result.z ).to.closeTo( 17.74227980370774, Number.EPSILON );

		} );

		it( 'should return null if the ray does not intersect the OBB', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, 1 ) );

			expect( ray.intersectOBB( obb, new Vector3() ) ).to.be.null;

		} );

		it( 'should return an intersection if the ray starts inside the OBB', function () {

			const ray = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, - 1 ) );
			const result = new Vector3();

			ray.intersectOBB( obb, result );

			expect( result.x ).to.closeTo( 0, Number.EPSILON );
			expect( result.y ).to.closeTo( - 8.881784197001252e-16, Number.EPSILON );
			expect( result.z ).to.closeTo( - 10.114982096196615, Number.EPSILON );

		} );

	} );

	describe( '#intersectsOBB()', function () {

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

		const convexHull = new OBB().fromPoints( points );

		it( 'should return true if the ray intersects the OBB', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, - 1 ) );

			expect( ray.intersectsOBB( convexHull ) ).to.be.true;

		} );

		it( 'should return false if the ray does not intersect the OBB', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, 1 ) );

			expect( ray.intersectsOBB( convexHull ) ).to.be.false;

		} );

	} );

	describe( '#intersectConvexHull()', function () {

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

		const convexHull = new ConvexHull().fromPoints( points );

		it( 'should fill the given result vector with the intersection point of a ray/convex hull intersection test', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, - 1 ) );
			const result = new Vector3();

			ray.intersectConvexHull( convexHull, result );

			expect( result.x ).to.equal( 0 );
			expect( result.y ).to.equal( 0 );
			expect( result.z ).to.closeTo( 11.426934097421203, Number.EPSILON );

		} );

		it( 'should return null if the ray does not intersect the convex hull', function () {

			const ray = new Ray( new Vector3( - 10, 3, 20 ), new Vector3( - 0.8, 1, - 1 ).normalize() );

			expect( ray.intersectConvexHull( convexHull, new Vector3() ) ).to.be.null;

		} );

		it( 'should return null if the ray origin is outside the convex hull and turned away', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, 1 ) );

			expect( ray.intersectConvexHull( convexHull, new Vector3() ) ).to.be.null;

		} );

		it( 'should return an intersection if the ray starts inside the convex hull', function () {

			const ray = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 0, 0, - 1 ) );
			const result = new Vector3();

			ray.intersectConvexHull( convexHull, result );

			expect( result.x ).to.equal( 0 );
			expect( result.y ).to.equal( 0 );
			expect( result.z ).to.closeTo( - 2.484848484848485, Number.EPSILON );

		} );

		it( 'should return an intersection if the ray is parallel to a plane an intersects the convex hull', function () {

			const normal = new Vector3().subVectors( new Vector3( 14, - 14, 2 ), new Vector3( 0, 14, - 8 ) );

			const ray = new Ray( new Vector3( 0, 0, 0 ), normal.normalize() );
			const result = new Vector3();

			ray.intersectConvexHull( convexHull, result );

			expect( result.x ).to.closeTo( 4.475597772682606, Number.EPSILON );
			expect( result.y ).to.closeTo( - 8.951195545365213, Number.EPSILON );
			expect( result.z ).to.closeTo( 3.1968555519161477, Number.EPSILON );

		} );

	} );

	describe( '#intersectsConvexHull()', function () {

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

		const convexHull = new ConvexHull().fromPoints( points );

		it( 'should return true if the ray intersects the convex hull', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, - 1 ) );

			expect( ray.intersectsConvexHull( convexHull ) ).to.be.true;

		} );

		it( 'should return false if the ray does not intersect the convex hull', function () {

			const ray = new Ray( new Vector3( 0, 0, 20 ), new Vector3( 0, 0, 1 ) );

			expect( ray.intersectsConvexHull( convexHull ) ).to.be.false;

		} );

	} );

	describe( '#intersectTriangle()', function () {

		it( 'should fill the given result vector with the intersection point of a ray/triangle intersection test', function () {

			const ray = new Ray( new Vector3(), v2 );
			const triangle = {
				a: new Vector3( 1, - 1, 1 ),
				b: new Vector3( - 1, - 1, 1 ),
				c: new Vector3( 0, 1, 1 ),
			};

			const result = new Vector3();
			 ray.intersectTriangle( triangle, true, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should not detect an intersection and return null if the direction of the ray is wrong', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, - 1 ) );
			const triangle = {
				a: new Vector3( 1, - 1, 1 ),
				b: new Vector3( - 1, - 1, 1 ),
				c: new Vector3( 0, 1, 1 ),
			};

			const result = new Vector3();
			ray.intersectTriangle( triangle, false, result );

			expect( ray.intersectTriangle( triangle, false, result ) ).to.equal( null );

		} );

		it( 'should not detect an intersection and return null if the ray hits the back side of the triangle', function () {

			const ray = new Ray( new Vector3(), v2 );
			const triangle = {
				a: new Vector3( - 1, - 1, 1 ),
				b: new Vector3( 1, - 1, 1 ),
				c: new Vector3( 0, 1, 1 ),
			};

			const result = new Vector3();

			expect( ray.intersectTriangle( triangle, true, result ) ).to.be.null;

		} );

		it( 'should detect an intersection if the ray hits the back side of the triangle and backface culling is set to false', function () {

			const ray = new Ray( new Vector3(), v2 );
			const triangle = {
				a: new Vector3( - 1, - 1, 1 ),
				b: new Vector3( 1, - 1, 1 ),
				c: new Vector3( 0, 1, 1 ),
			};

			const result = new Vector3();
			ray.intersectTriangle( triangle, false, result );

			expect( result ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

		it( 'should detect an intersection if the ray touches the triangle', function () {

			const ray = new Ray( new Vector3( 1, - 1, 1 ), v2 );
			const triangle = {
				a: new Vector3( 1, - 1, 1 ),
				b: new Vector3( - 1, - 1, 1 ),
				c: new Vector3( 0, 1, 1 ),
			};

			const result = new Vector3();
			ray.intersectTriangle( triangle, true, result );

			expect( result ).to.deep.equal( { x: 1, y: - 1, z: 1 } );

		} );

		it( 'should not detect an intersection and return null if the ray misses the triangle', function () {

			const ray1 = new Ray( new Vector3( - 2, 0, 0 ), v2 );
			const ray2 = new Ray( new Vector3( 2, 0, 0 ), v2 );

			const triangle = {
				a: new Vector3( 1, - 1, 1 ),
				b: new Vector3( - 1, - 1, 1 ),
				c: new Vector3( 0, 1, 1 ),
			};

			const result = new Vector3();

			expect( ray1.intersectTriangle( triangle, true, result ) ).to.be.null;
			expect( ray2.intersectTriangle( triangle, true, result ) ).to.be.null;

		} );

		it( 'should not detect an intersection and return null if the ray is parallel to the triangle plane', function () {

			const ray = new Ray( new Vector3(), new Vector3( 0, 0, 1 ) );
			const triangle = {
				a: new Vector3( 1, 0, 1 ),
				b: new Vector3( - 1, 0, 1 ),
				c: new Vector3( 0, 0, 1 ),
			};

			const result = new Vector3();
			ray.intersectTriangle( triangle, true, result );

			expect( ray.intersectTriangle( triangle, true, result ) ).to.equal( null );

		} );

	} );

	describe( '#intersectBVH()', function () {

		const bvh = new BVH();
		const vertices = new Float32Array( [
			0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
			0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
		] );

		const geometry = new MeshGeometry( vertices );
		bvh.fromMeshGeometry( geometry );

		it( 'should fill the given result vector with the intersection point of a ray/BVH intersection test', function () {

			const ray = new Ray( new Vector3( 0.5, 1, 0.25 ), new Vector3( 0, - 1, 0 ) );
			const result = new Vector3();

			expect( ray.intersectBVH( bvh, result ) ).to.deep.equal( new Vector3( 0.5, 0, 0.25 ) );

		} );

		it( 'should return null if the ray does not intersect the BVH', function () {

			const ray = new Ray( new Vector3( 0.5, 1, 0.25 ), new Vector3( 0, 1, 0 ) );

			expect( ray.intersectBVH( bvh, new Vector3() ) ).to.be.null;

		} );

		it( 'should return null if the ray does intersect a bounding volume but not a primitive', function () {

			const ray = new Ray( new Vector3( 0.9, 1, 0.9 ), new Vector3( 0, - 1, 0 ) );

			expect( ray.intersectBVH( bvh, new Vector3() ) ).to.be.null;

		} );

		it( 'should return the closest possible intersection', function () {

			const bvh = new BVH();
			const vertices = new Float32Array( [
				0, 0, 0, 	0.5, 0, 1, 	1, 0, 0,
				0, - 0.5, 0, 	0.5, - 0.5, 1, 	1, - 0.5, 0,
				0, 0.5, 0, 	0.5, 0.5, 1, 	1, 0.5, 0,
			] );

			const geometry = new MeshGeometry( vertices );
			bvh.fromMeshGeometry( geometry );

			const ray = new Ray( new Vector3( 0.5, 1, 0.25 ), new Vector3( 0, - 1, 0 ) );
			const result = new Vector3();

			expect( ray.intersectBVH( bvh, result ) ).to.deep.equal( new Vector3( 0.5, 0.5, 0.25 ) );

		} );

	} );

	describe( '#intersectsBVH()', function () {

		const bvh = new BVH();
		const vertices = new Float32Array( [
			0, 0, 0, 	1, 0, 0, 	0.5, 0, - 1,
			0, 0, 0, 	0.5, 0, 1, 	1, 0, 0
		] );

		const geometry = new MeshGeometry( vertices );
		bvh.fromMeshGeometry( geometry );

		it( 'should return true if the ray intersects the BVH', function () {

			const ray = new Ray( new Vector3( 0.5, 1, 0.25 ), new Vector3( 0, - 1, 0 ) );

			expect( ray.intersectsBVH( bvh ) ).to.be.true;

		} );

		it( 'should return false if the ray does not intersect the BVH', function () {

			const ray = new Ray( new Vector3( 0.5, 1, 0.25 ), new Vector3( 0, 1, 0 ) );

			expect( ray.intersectsBVH( bvh ) ).to.be.false;

		} );

		it( 'should return false if the ray does intersect a bounding volume but not a primitive', function () {

			const ray = new Ray( new Vector3( 0.9, 1, 0.9 ), new Vector3( 0, - 1, 0 ) );

			expect( ray.intersectsBVH( bvh ) ).to.be.false;

		} );

	} );

	describe( '#applyMatrix4()', function () {

		it( 'should transform this ray by the given 4x4 matrix', function () {

			const r1 = new Ray( new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ).normalize() );
			const m1 = new Matrix4();

			const position = new Vector3( 1, 2, 3 );
			const rotation = new Quaternion().fromEuler( Math.PI / 2, 0, 0 );

			m1.setPosition( position ).fromQuaternion( rotation );

			r1.applyMatrix4( m1 );

			expect( r1.origin.x ).to.closeTo( 1, Number.EPSILON );
			expect( r1.origin.y ).to.closeTo( - 0.9999999999999998, Number.EPSILON );
			expect( r1.origin.z ).to.closeTo( 1.0000000000000002, Number.EPSILON );

			expect( r1.direction.x ).to.closeTo( 0.5773502691896258, Number.EPSILON );
			expect( r1.direction.y ).to.closeTo( - 0.5773502691896257, Number.EPSILON );
			expect( r1.direction.z ).to.closeTo( 0.577350269189626, Number.EPSILON );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if equal else false', function () {

			const r1 = new Ray();
			const r2 = new Ray( v1, v2 );

			expect( r1.equals( new Ray() ) ).to.be.true;
			expect( r1.equals( r2 ) ).to.be.false;

		} );

	} );

} );
