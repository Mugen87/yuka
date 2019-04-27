/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Plane = YUKA.Plane;
const Vector3 = YUKA.Vector3;

describe( 'Plane', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const normal = new Vector3( 0, 0, 1 );
			const plane = new Plane();

			expect( plane ).to.have.a.property( 'normal' ).that.is.an.instanceof( Vector3 ).and.deep.equal( normal );
			expect( plane ).to.have.a.property( 'constant' ).that.is.equal( 0 );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const normal = new Vector3( 0, 1, 0 );
			const constant = 1;

			const plane = new Plane( normal, constant );
			expect( plane.normal ).to.equal( normal );
			expect( plane.constant ).to.equal( constant );

		} );

	} );

	describe( '#set()', function () {

		it( 'should apply the given values to the object', function () {

			const normal = new Vector3( 0, 1, 0 );
			const constant = 1;

			const plane = new Plane().set( normal, constant );

			expect( plane.normal ).to.equal( normal );
			expect( plane.constant ).to.equal( constant );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy all values from the given object', function () {

			const normal = new Vector3( 0, 1, 0 );
			const constant = 1;

			const plane1 = new Plane( normal, constant );
			const plane2 = new Plane();

			plane2.copy( plane1 );

			expect( plane2.normal ).to.deep.equal( normal );
			expect( plane2.constant ).to.equal( constant );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should create a new object', function () {

			const normal = new Vector3( 0, 1, 0 );
			const constant = 1;

			const plane1 = new Plane( normal, constant );
			const plane2 = plane1.clone();


			expect( plane2 ).not.to.equal( plane1 );

		} );

		it( 'should copy the values of the current object to the new one', function () {

			const normal = new Vector3( 0, 1, 0 );
			const constant = 1;

			const plane1 = new Plane( normal, constant );
			const plane2 = plane1.clone();

			expect( plane2.normal ).to.deep.equal( normal );
			expect( plane2.constant ).to.equal( constant );

		} );

	} );

	describe( '#distanceToPoint()', function () {

		it( 'should return the signed distance from a given point to the plane', function () {

			const normal = new Vector3( 0, 1, 0 );
			const constant = - 2;

			const point1 = new Vector3( 0, 2, 0 ); // coplanar
			const point2 = new Vector3( 0, 3, 0 ); // + 1
			const point3 = new Vector3( 0, 1, 0 ); // - 1

			const plane = new Plane( normal, constant );

			expect( plane.distanceToPoint( point1 ) ).to.equal( 0 );
			expect( plane.distanceToPoint( point2 ) ).to.equal( 1 );
			expect( plane.distanceToPoint( point3 ) ).to.equal( - 1 );

		} );

	} );

	describe( '#fromNormalAndCoplanarPoint()', function () {

		it( 'should create a plane from the given normal and coplanar point', function () {

			const normal = new Vector3( 0, 1, 0 );
			const point = new Vector3( 0, 2, 0 );

			const plane = new Plane().fromNormalAndCoplanarPoint( normal, point );

			expect( plane.normal ).to.deep.equal( normal );
			expect( plane.constant ).to.equal( - 2 );

		} );

	} );

	describe( '#fromCoplanarPoints()', function () {

		it( 'should create a plane from the given coplanar points', function () {

			const normal = new Vector3( 0, - 1, 0 );

			const point1 = new Vector3( 1, 2, 0 );
			const point2 = new Vector3( 2, 2, - 4 );
			const point3 = new Vector3( 3, 2, 4 );

			const plane = new Plane().fromCoplanarPoints( point1, point2, point3 );

			expect( plane.normal ).to.deep.equal( normal );
			expect( plane.constant ).to.equal( 2 );

		} );

	} );

	describe( '#intersectPlane()', function () {

		it( 'should fill the given result vector with the intersection point of a plane/plane intersection test', function () {

			const plane1 = new Plane( new Vector3( 0, 1, 0 ), 0 );
			const plane2 = new Plane( new Vector3( 0, 0, 1 ), - 1 );
			const intersection = new Vector3();

			expect( plane1.intersectPlane( plane2, intersection ) ).to.deep.equal( { x: 0, y: 0, z: - 1 } );

		} );

		it( 'should return null if there is no intersection', function () {

			// planes are parallel

			const plane1 = new Plane( new Vector3( 0, 1, 0 ), 0 );
			const plane2 = new Plane( new Vector3( 0, 1, 0 ), - 1 );
			const intersection = new Vector3();

			expect( plane1.intersectPlane( plane2, intersection ) ).to.be.null;

		} );

	} );

	describe( '#intersectsPlane()', function () {

		it( 'should return true if the given plane intersects this plane', function () {

			const plane1 = new Plane( new Vector3( 0, 1, 0 ), 0 );
			const plane2 = new Plane( new Vector3( 0, 0, 1 ), - 1 );

			expect( plane1.intersectsPlane( plane2 ) ).to.be.true;

		} );

		it( 'should return true if the given plane does not intersect this plane', function () {

			// planes are parallel

			const plane1 = new Plane( new Vector3( 0, 1, 0 ), 0 );
			const plane2 = new Plane( new Vector3( 0, 1, 0 ), - 1 );

			expect( plane1.intersectsPlane( plane2 ) ).to.be.false;

		} );

	} );

	describe( '#projectPoint()', function () {

		it( 'should project a point onto the given plane', function () {

			const plane = new Plane( new Vector3( 0, 1, 0 ), - 2 );
			const point1 = new Vector3( 5, 0, 0 );
			const point2 = new Vector3( 5, 0, 3 );
			const point3 = new Vector3( 5, - 3, 0 );
			const point4 = new Vector3( 1, 2, 1 ); // point already on the plane
			const result = new Vector3();

			expect( plane.projectPoint( point1, result ) ).to.deep.equal( new Vector3( 5, 2, 0 ) );
			expect( plane.projectPoint( point2, result ) ).to.deep.equal( new Vector3( 5, 2, 3 ) );
			expect( plane.projectPoint( point3, result ) ).to.deep.equal( new Vector3( 5, 2, 0 ) );
			expect( plane.projectPoint( point4, result ) ).to.deep.equal( new Vector3( 1, 2, 1 ) );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if both planes are equal else false', function () {

			const plane1 = new Plane( new Vector3( 0, 1, 0 ), - 2 );
			const plane2 = new Plane( new Vector3( 0, 1, 0 ), - 2 );
			const plane3 = new Plane( new Vector3( 0, 2, 0 ), - 4 );

			expect( plane1.equals( plane2 ) ).to.be.true;
			expect( plane1.equals( plane3 ) ).to.be.false;

		} );

	} );

} );
