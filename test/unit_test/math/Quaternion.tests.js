/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Matrix3 = YUKA.Matrix3;
const Matrix4 = YUKA.Matrix4;
const Vector3 = YUKA.Vector3;
const Quaternion = YUKA.Quaternion;

describe( 'Quaternion', function () {

	describe( '#constructor', function () {

		it( 'should return quaternion with default parameters', function () {

			const q1 = new Quaternion();

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

		it( 'should return quaternion with given parameters', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );

			expect( q1 ).to.deep.equal( { x: 0, y: 1, z: 0, w: 0 } );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set given parameters to quaternion', function () {

			const q1 = new Quaternion().set( 0, 1, 0, 0 );

			expect( q1 ).to.deep.equal( { x: 0, y: 1, z: 0, w: 0 } );

		} );

	} );


	describe( '#copy()', function () {

		it( 'should copy a given quaternion to the current instance', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion().copy( q1 );

			expect( q2 ).to.deep.equal( q1 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of the quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = q1.clone();

			expect( q2 ).to.deep.equal( q1 );

		} );

	} );

	describe( '#inverse()', function () {

		it( 'should produce the inverse of the quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 1 ).inverse();
			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( - 0.7071067811865475, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );
			expect( q1.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

		} );

	} );

	describe( '#conjugate()', function () {

		it( 'should conjugate the quaternion', function () {

			const q1 = new Quaternion( 1, 1, 1, 1 ).conjugate();
			expect( q1 ).to.deep.equal( { x: - 1, y: - 1, z: - 1, w: 1 } );

		} );

	} );

	describe( '#dot()', function () {

		it( 'should perform the dot product', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			expect( q1.dot( q1 ) ).to.deep.equal( 1 );

		} );

	} );

	describe( '#length()', function () {

		it( 'should return the length of the quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 1 );
			expect( q1.length() ).to.closeTo( 1.4142135623730951, Number.EPSILON );

		} );

	} );

	describe( '#squaredLength()', function () {

		it( 'should return the squared length of the quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 1 );
			expect( q1.squaredLength() ).to.deep.equal( 2 );

		} );

	} );

	describe( '#normalize()', function () {

		it( 'should normalize the quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 1 ).normalize();
			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );
			expect( q1.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

		} );

		it( 'should produce the default quaternion if the length is zero', function () {

			const q1 = new Quaternion( 0, 0, 0, 0 ).normalize();
			expect( q1.normalize() ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

	} );

	describe( '#multiply()', function () {

		it( 'should perform a multiplication between two quaternions', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 );

			q1.multiply( q2 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: - 1, w: 0 } );

		} );

	} );

	describe( '#premultiply()', function () {

		it( 'should perform a multiplication between two quaternions but in different order', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 );

			q1.premultiply( q2 );

			expect( q2 ).to.deep.equal( { x: 1, y: 0, z: 0, w: 0 } );

		} );

	} );

	describe( '#multiplyQuaternions()', function () {

		it( 'should perform a multiplication between two given quaternions and store the result in the current instance', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 );
			const q3 = new Quaternion().multiplyQuaternions( q1, q2 );

			expect( q3 ).to.deep.equal( { x: 0, y: 0, z: - 1, w: 0 } );

		} );

	} );

	describe( '#angleTo()', function () {

		it( 'should return the shortest angle between two quaternions', function () {

			const q1 = new Quaternion( 0, 0, 0, 1 );
			const q2 = new Quaternion( 0, 1, 0, 0 );

			expect( q1.angleTo( q2 ) ).to.closeTo( Math.PI, Number.EPSILON );

		} );

	} );

	describe( '#rotateTo()', function () {

		it( 'should gradually rotate a quaternion to another a target quaternion by a given angular step', function () {

			const q1 = new Quaternion( 0, 0, 0, 1 );
			const q2 = new Quaternion( 0, 1, 0, 0 );
			const step = Math.PI * 0.5;

			q1.rotateTo( q2, step );

			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );
			expect( q1.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

			q1.rotateTo( q2, step );

			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 1, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );
			expect( q1.w ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'should not overshoot the target quaternion', function () {

			const q1 = new Quaternion( 0, 0, 0, 1 );
			const q2 = new Quaternion( 0, 1, 0, 0 );
			const step = Math.PI * 1.5;

			q1.rotateTo( q2, step );

			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 1, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );
			expect( q1.w ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'should make an early out if the angle between both quaternions is zero', function () {

			const q1 = new Quaternion( 0, 0, 0, 1 );
			const q2 = new Quaternion( 0, 0, 0, 1 );
			const step = Math.PI;

			q1.rotateTo( q2, step );

			expect( q1 ).to.deep.equal( q1 );

		} );

	} );

	describe( '#lookAt()', function () {

		it( 'should produce a quaternion which rotates an object towards a specific target direction', function () {

			const v0 = new Vector3( 0, 0, 1 );
			const v1 = new Vector3( 0, 0, - 1 );
			const v2 = new Vector3( 0, 1, 0 );

			const q1 = new Quaternion();
			q1.lookAt( v0, v1, v2 );

			expect( q1 ).to.deep.equal( { x: 0, y: 1, z: 0, w: 0 } );

		} );

	} );

	describe( '#slerp()', function () {

		it( 'should perform a spherical linear interpolation from one quaternion to another one with the given interpolation parameter', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 0, 0, 0, 1 );

			q1.slerp( q2, 0.5 );

			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );
			expect( q1.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

		} );

		it( 'should perform a spherical linear interpolation from one quaternion to another one with the given interpolation parameter (cosHalfTheta < 0)', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( - 1, 0, 0, 0 );
			const t = 0.5;

			expect( q1.slerp( q2, t ) ).to.deep.equal( { x: 1, y: 0, z: 0, w: 0 } );

		} );

		it( 'should perform a spherical linear interpolation from one quaternion to another one with the given interpolation parameter (Math.abs( sinHalfTheta ) < 0.001)', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0.9999999, 0, 0, 0 );
			const t = 0.5;
			q1.slerp( q2, t );
			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0.9999999500000001, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'should produce the initial quaternion when the interpolation parameter is zero', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 0, 0, 0, 1 );

			q1.slerp( q2, 0 );

			expect( q1 ).to.deep.equal( q1 );

		} );

		it( 'should produce the target quaternion when the interpolation parameter is one', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 0, 0, 0, 1 );

			q1.slerp( q2, 1 );

			expect( q1 ).to.deep.equal( q2 );

		} );

	} );

	describe( '#extractRotationFromMatrix()', function () {

		it( 'should extract the rotation of the given 4x4 matrix and stores it in this quaternion.', function () {

			const m1 = new Matrix4();
			const q1 = new Quaternion();

			const position = new Vector3();
			const rotation = new Quaternion().fromEuler( Math.PI / 2, 0, 0 );
			const scale = new Vector3( 2, 2, 2 );

			m1.compose( position, rotation, scale );

			q1.extractRotationFromMatrix( m1 );

			expect( q1.x ).to.closeTo( rotation.x, Number.EPSILON );
			expect( q1.y ).to.closeTo( rotation.y, Number.EPSILON );
			expect( q1.z ).to.closeTo( rotation.z, Number.EPSILON );
			expect( q1.w ).to.closeTo( rotation.w, Number.EPSILON );

		} );

	} );

	describe( '#fromEuler()', function () {

		it( 'should return a quaternion from euler angles', function () {

			const q1 = new Quaternion().fromEuler( 0, 0, 0 );
			const q2 = new Quaternion().fromEuler( Math.PI / 2, Math.PI, 0 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

			expect( q2.x ).to.closeTo( 0, Number.EPSILON );
			expect( q2.y ).to.closeTo( 0.7071067811865476, Number.EPSILON );
			expect( q2.z ).to.closeTo( - 0.7071067811865475, Number.EPSILON );
			expect( q2.w ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#toEuler()', function () {

		it( 'should return a quaternion from euler angles', function () {

			const q1 = new Quaternion().fromEuler( Math.PI / 2, Math.PI, 0 );

			const euler = { x: 0, y: 0, z: 0 };

			q1.toEuler( euler );

			expect( euler ).to.deep.equal( { x: Math.PI / 2, y: Math.PI, z: 0 } );

		} );

	} );

	describe( '#fromMatrix3()', function () {

		it( 'should return a quaternion from a 3x3 rotation matrix', function () {

			const m1 = new Matrix3();
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

		it( 'should return a quaternion from a 3x3 rotation matrix (negative trace)', function () {

			const m1 = new Matrix3().set( - 1, 0, 0, 0, - 1, 0, 0, 0, 1 );
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 1, w: 0 } );

		} );

		it( 'should return a quaternion from a 3x3 rotation matrix (m11>m22 && m11>m33)', function () {

			const m1 = new Matrix3().set( 1, 0, 0, 0, - 1, 0, 0, 0, 0, - 1 );
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0.8660254037844386, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'should return a quaternion from a 3x3 rotation matrix (m22>m33)', function () {

			const m1 = new Matrix3().set( - 1, 0, 0, 0, 0, 1, 0, 0, 0, - 1 );
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0.35355339059327373, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0.7071067811865476, Number.EPSILON );

		} );

	} );

	describe( '#fromArray()', function () {

		it( 'should setup the quaternion with values from an array', function () {

			const q1 = new Quaternion().fromArray( [ 0, 0, 0, 1 ] );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

	} );

	describe( '#toArray()', function () {

		it( 'should store all values of the quaternion in the given array', function () {

			const q1 = new Quaternion();
			const array = [];

			q1.toArray( array );

			expect( array ).to.deep.equal( [ 0, 0, 0, 1 ] );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if the given quaternion is equal to the current instance', function () {

			const q1 = new Quaternion( 0, 0, 0, - 1 );
			const q2 = new Quaternion( 0, 0, 0, - 1 );
			const q3 = new Quaternion();

			expect( q1.equals( q2 ) ).to.be.true;
			expect( q1.equals( q3 ) ).to.be.false;

		} );

	} );

} );
