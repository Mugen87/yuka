/**
 * @author robp94 / https://github.com/robp94
 */
const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Matrix3 = YUKA.Matrix3;
const Vector3 = YUKA.Vector3;
const Quaternion = YUKA.Quaternion;

describe( 'Quaternion', function () {

	describe( '#constructor', function () {

		it( 'should return quaternion with default parameters', function () {

			const q1 = new Quaternion();

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

		it( 'should return quaternion with given parameters', function () {

			const q1 = new Quaternion( 0, 0, 0, - 1 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: - 1 } );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set given parameters to quaternion', function () {

			const q1 = new Quaternion().set( 0, 0, 0, - 1 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: - 1 } );

		} );

	} );


	describe( '#copy()', function () {

		it( 'should return copy of quaternion', function () {

			const q1 = new Quaternion( 0, 0, 0, - 1 );
			const q2 = new Quaternion().copy( q1 );

			expect( q2 ).to.deep.equal( q1 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return clone of quaternion', function () {

			const q1 = new Quaternion( 0, 0, 0, - 1 );
			const q2 = q1.clone();

			expect( q2 ).to.deep.equal( q1 );

		} );

	} );

	describe( '#equal()', function () {

		it( 'should return true if equal else false', function () {

			const q1 = new Quaternion( 0, 0, 0, - 1 );
			const q2 = new Quaternion( 0, 0, 0, - 1 );
			const q3 = new Quaternion();

			expect( q1.equals( q2 ) ).to.be.true;
			expect( q1.equals( q3 ) ).to.be.false;

		} );

	} );

	describe( '#inverse()', function () {

		it( 'should return inverse of quaternion', function () {

			const q1 = new Quaternion( 0, 0, 0, - 1 ).inverse();
			expect( q1 ).to.deep.equal( { x: - 0, y: - 0, z: - 0, w: - 1 } );

		} );

	} );

	describe( '#conjugate()', function () {

		it( 'should return conjugate of quaternion', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 ).conjugate();
			expect( q1 ).to.deep.equal( { x: - 1, y: - 0, z: - 0, w: 0 } );

		} );

	} );

	describe( '#dot()', function () {

		it( 'should return dot product', function () {

			const q1 = new Quaternion();
			expect( q1.dot( q1 ) ).to.deep.equal( 1 );

		} );

	} );

	describe( '#length()', function () {

		it( 'should return length of quaternion', function () {

			const q1 = new Quaternion( 1, 1, 0, 0 );
			expect( q1.length() ).to.closeTo( 1.4142135623730951, Number.EPSILON );

		} );

	} );

	describe( '#squaredLength()', function () {

		it( 'should return squared length of quaternion', function () {

			const q1 = new Quaternion();
			expect( q1.squaredLength() ).to.deep.equal( 1 );

		} );

	} );

	describe( '#normalize()', function () {

		it( 'should return normalized quaternion', function () {

			const q1 = new Quaternion( 0, 4, 0, 0 ).normalize();
			expect( q1 ).to.deep.equal( { x: 0, y: 1, z: 0, w: 0 } );

		} );

		it( 'should return (0,0,0,1) if length is zero)', function () {

			const q1 = new Quaternion( 0, 0, 0, 0 ).normalize();
			expect( q1.normalize() ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

	} );

	describe( '#multiply()', function () {

		it( 'should return multiplied quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 ).multiply( q1 );

			expect( q2 ).to.deep.equal( { x: 0, y: 0, z: 1, w: 0 } );

		} );

	} );

	describe( '#premultiply()', function () {

		it( 'should return premultiplied quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 ).premultiply( q1 );

			expect( q2 ).to.deep.equal( { x: 0, y: 0, z: - 1, w: 0 } );

		} );

	} );

	describe( '#multiplyQuaternions()', function () {

		it( 'should return multiplied quaternion', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 );
			const q3 = new Quaternion().multiplyQuaternions( q1, q2 );

			expect( q3 ).to.deep.equal( { x: 0, y: 0, z: - 1, w: 0 } );

		} );

	} );

	describe( '#angleTo()', function () {

		it( 'should return angle to quaternion', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0, 1, 0, 0 );

			expect( q1.angleTo( q2 ) ).to.closeTo( Math.PI, Number.EPSILON );

		} );

	} );

	describe( '#rotateTo()', function () {

		it( 'should return quaternion rotated to other quaternion', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0, 1, 0, 0 );
			const step = Math.PI;
			expect( q1.rotateTo( q2, step ) ).to.deep.equal( q2 );

		} );

	} );

	describe( '#lookAt()', function () {

		it( 'should return quaternion which looks at', function () {

			const v0 = new Vector3( 0, 0, 1 );
			const v1 = new Vector3( 0, 0, - 1 );
			const v2 = new Vector3( 0, 1, 0 );

			const q1 = new Quaternion();
			q1.lookAt( v0, v1, v2 );

			expect( q1 ).to.deep.equal( { x: 0, y: 1, z: 0, w: 0 } );

		} );

	} );

	describe( '#slerp()', function () {

		it( 'should return unchanged quaternion if t is zero', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0, 1, 0, 0 );
			const t = 0;
			expect( q1.slerp( q2, t ) ).to.deep.equal( q1 );

		} );

		it( 'should return q if t is one', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0, 1, 0, 0 );
			const t = 1;
			expect( q1.slerp( q2, t ) ).to.deep.equal( q2 );

		} );

		it( 'cosHalfTheta < 0', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( - 1, 0, 0, 0 );
			const t = 0.5;

			expect( q1.slerp( q2, t ) ).to.deep.equal( { x: 1, y: 0, z: 0, w: 0 } );

		} );

		it( 'cosHalfTheta >= 0 && cosHalfTheta < 1', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0.5, 0, 0, 0 );
			const t = 0.5;
			q1.slerp( q2, t );
			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0.8660254037844386, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'cosHalfTheta >= 1', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 1, 0, 0, 0 );
			const t = 0.5;

			expect( q1.slerp( q2, t ) ).to.deep.equal( { x: 1, y: 0, z: 0, w: 0 } );

		} );

		it( 'Math.abs( sinHalfTheta ) < 0.001', function () {

			const q1 = new Quaternion( 1, 0, 0, 0 );
			const q2 = new Quaternion( 0.9999999, 0, 0, 0 );
			const t = 0.5;
			q1.slerp( q2, t );
			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0.9999999500000001, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#fromEuler()', function () {

		it( 'should return quaternion from euler', function () {

			const q1 = new Quaternion().fromEuler( 0, 0, 0 );
			const q2 = new Quaternion().fromEuler( Math.PI / 2, 0, 0 );
			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );
			expect( q2.w ).to.closeTo( 0.7071067811865476, Number.EPSILON );
			expect( q2.x ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( q2.y ).to.closeTo( 0, Number.EPSILON );
			expect( q2.z ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#fromMatrix3()', function () {

		it( 'should return quaternion from matrix', function () {

			const m1 = new Matrix3();
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );
		it( 'should return quaternion from matrix trace negative', function () {

			const m1 = new Matrix3().set( - 1, 0, 0, 0, - 1, 0, 0, 0, 1 );
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 1, w: 0 } );

		} );
		it( 'm11>m22,m11>m33', function () {

			const m1 = new Matrix3().set( 1, 0, 0, 0, - 1, 0, 0, 0, 0, - 1 );
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0.8660254037844386, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'm22>m33', function () {

			const m1 = new Matrix3().set( - 1, 0, 0, 0, 0, 1, 0, 0, 0, - 1 );
			const q1 = new Quaternion().fromMatrix3( m1 );

			expect( q1.w ).to.closeTo( 0, Number.EPSILON );
			expect( q1.x ).to.closeTo( 0, Number.EPSILON );
			expect( q1.y ).to.closeTo( 0.35355339059327373, Number.EPSILON );
			expect( q1.z ).to.closeTo( 0.7071067811865476, Number.EPSILON );

		} );

	} );

	describe( '#fromArray()', function () {

		it( 'should return quaternion from matrix', function () {

			const q1 = new Quaternion().fromArray( [ 0, 0, 0, 1 ] );

			expect( q1 ).to.deep.equal( { x: 0, y: 0, z: 0, w: 1 } );

		} );

	} );

	describe( '#toArray()', function () {

		it( 'should return quaternion from matrix', function () {

			const q1 = new Quaternion();

			expect( q1.toArray() ).to.deep.equal( [ 0, 0, 0, 1 ] );

		} );

	} );

} );
