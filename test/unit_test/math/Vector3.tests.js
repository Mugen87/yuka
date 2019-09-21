/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Vector3 = YUKA.Vector3;
const Matrix3 = YUKA.Matrix3;
const Matrix4 = YUKA.Matrix4;
const Quaternion = YUKA.Quaternion;

const x = 1, y = 2, z = 3;

describe( 'Vector3', function () {

	describe( '#set()', function () {

		it( 'should apply the given parameters to the vector', function () {

			const v1 = new Vector3( );
			v1.set( x, y, z );
			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy a given vector to the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3().copy( v1 );

			expect( v2 ).to.deep.equal( { x: v1.x, y: v1.y, z: v1.z } );

			// ensure that it is a true copy
			v1.x = 0;
			v1.y = - 1;
			v1.z = - 2;
			expect( v2 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return a clone of the vector', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = v1.clone();

			expect( v2 ).to.deep.equal( { x: v1.x, y: v1.y, z: v1.z } );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add a vector to the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( x, y, z );
			v1.add( v2 );

			expect( v1 ).to.deep.equal( { x: x * 2, y: y * 2, z: z * 2 } );

		} );

	} );

	describe( '#addScalar()', function () {

		it( 'should add a scalar value to the current instance', function () {

			const v1 = new Vector3( x, y, z );
			v1.addScalar( 0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#addVectors()', function () {

		it( 'should add the two given vectors and store the result in the current instance', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3( x, y, z );
			const v2 = new Vector3();

			v2.addVectors( v1, v0 );

			expect( v2 ).to.deep.equal( { x: x * 2, y: y * 2, z: z * 2 } );

		} );

	} );

	describe( '#sub', function () {

		it( 'should subtract the given vector from the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( x, y, z );

			v1.sub( v2 );

			expect( v1 ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#subScalar()', function () {

		it( 'should subtract the given scalar from the current instance', function () {

			const v1 = new Vector3( x, y, z );
			v1.subScalar( 1 );

			expect( v1 ).to.deep.equal( { x: 0, y: 1, z: 2 } );

		} );

	} );

	describe( '#subVectors()', function () {

		it( 'should subtract two given vectors and store the result in the current instance', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3( x, y, z );
			const v2 = new Vector3();

			v2.subVectors( v1, v0 );

			expect( v2 ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#multiply()', function () {

		it( 'should multiply the given vector with the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( x, y, z );

			v1.multiply( v2 );

			expect( v1 ).to.deep.equal( { x: Math.pow( v2.x, 2 ), y: Math.pow( v2.y, 2 ), z: Math.pow( v2.z, 2 ) } );

		} );

	} );

	describe( '#multiplyScalar()', function () {

		it( 'should multiply the given scalar value with the current instance', function () {

			const v1 = new Vector3( x, y, z );
			v1.multiplyScalar( 2 );

			expect( v1 ).to.deep.equal( { x: x * 2, y: y * 2, z: z * 2 } );

		} );

	} );

	describe( '#multiplyVectors()', function () {

		it( 'should multiply two given vectors and store the result in the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3().multiplyVectors( v1, v1 );

			expect( v2 ).to.deep.equal( { x: Math.pow( v1.x, 2 ), y: Math.pow( v1.y, 2 ), z: Math.pow( v1.z, 2 ) } );

		} );

	} );

	describe( '#divide()', function () {

		it( 'should divide a vector through the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( x, y, z );

			v1.divide( v2 );

			expect( v1 ).to.deep.equal( { x: 1, y: 1, z: 1 } );

		} );

	} );

	describe( '#divideScalar()', function () {

		it( 'should divide a scalar value through the current instance', function () {

			const v1 = new Vector3( x, y, z );

			v1.divideScalar( 2 );

			expect( v1 ).to.deep.equal( { x: 0.5, y: 1, z: 1.5 } );

		} );

	} );

	describe( '#divideVectors()', function () {

		it( 'should divide two given vectors and store the result in the current instance', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( x, y, z );
			const v3 = new Vector3();

			v3.divideVectors( v1, v2 );

			expect( v3 ).to.deep.equal( { x: 1, y: 1, z: 1 } );

		} );

	} );

	describe( '#reflect()', function () {

		it( 'should reflect this vector along the given normal', function () {

			const v1 = new Vector3( 1, 0, - 1 );
			const n = new Vector3( 0, 0, 1 );

			v1.reflect( n );

			expect( v1 ).to.deep.equal( { x: 1, y: 0, z: 1 } );

		} );

	} );

	describe( '#clamp()', function () {

		it( 'should produce a vector with values between the given min/max vectors', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );
			const v2 = new Vector3( 2, - 1, 1 );

			v2.clamp( v0, v1 );
			expect( v2 ).to.deep.equal( { x: 1, y: 0, z: 1 } );

		} );

	} );

	describe( '#min()', function () {

		it( 'should produce a vector with minimum values of the given vector and this instance', function () {

			const v0 = new Vector3( 4, 5, 6 );
			const v1 = new Vector3( 6, 5, 4 );

			v0.min( v1 );

			expect( v0 ).to.deep.equal( { x: 4, y: 5, z: 4 } );

		} );

	} );

	describe( '#max()', function () {

		it( 'should produce a vector with maximum values of the given vector and this instance', function () {

			const v0 = new Vector3( 4, 5, 6 );
			const v1 = new Vector3( 6, 5, 4 );

			v0.max( v1 );

			expect( v0 ).to.deep.equal( { x: 6, y: 5, z: 6 } );

		} );

	} );

	describe( '#dot()', function () {

		it( 'should return the result of the dot product', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( - x, - y, - z );

			expect( v1.dot( v2 ) ).to.be.equal( ( ( - x * x ) + ( - y * y ) + ( - z * z ) ) );

		} );

		it( 'should return zero when both vectors are perpendicular', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 1, 0, 0 );

			expect( v1.dot( v2 ) ).to.be.equal( 0 );

		} );

		it( 'should return a positive result if both vectors head in similar directions', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 0.9, 0 );

			expect( v1.dot( v2 ) ).to.be.above( 0 );

		} );

		it( 'should return a negative result if both vectors are turned away', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, - 0.9, 0 );

			expect( v1.dot( v2 ) ).to.be.below( 0 );

		} );

	} );

	describe( '#cross()', function () {

		it( 'should perform the cross product', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const v2 = new Vector3( 2, - 1, 0.5 );

			v1.cross( v2 );
			expect( v1 ).to.deep.equal( { x: 1.5, y: 1.5, z: - 3 } );

		} );

		it( 'should produce a degenerated zero vector if both vectors are coplanar', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 2, 0 );

			v1.cross( v2 );
			expect( v1 ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#crossVectors', function () {

		it( 'should perform the cross product of two given vectors and store the result in the current instance', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const v2 = new Vector3( 2, - 1, 0.5 );
			const v3 = new Vector3().crossVectors( v1, v2 );

			expect( v3 ).to.deep.equal( { x: 1.5, y: 1.5, z: - 3 } );

		} );

		it( 'should produce a degenerated zero vector if both vectors are coplanar', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 2, 0 );
			const v3 = new Vector3().crossVectors( v1, v2 );

			expect( v3 ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#angleTo()', function () {

		it( 'should return the angle between the given vector and the current instance', function () {

			const v1 = new Vector3( 1, 0, 0 );
			const v2 = new Vector3( 0, 1, 0 );

			expect( v1.angleTo( v1 ) ).to.be.equal( 0 );
			expect( v1.angleTo( v2 ) ).to.be.equal( Math.PI / 2 );

		} );

		it( 'should not return a NaN value but 0 when one or both vectors are null vectors', function () {

			const v1 = new Vector3( 1, 0, 0 );
			const v2 = new Vector3( 0, 0, 0 );

			expect( v1.angleTo( v2 ) ).to.be.equal( 0 );
			expect( v2.angleTo( v2 ) ).to.be.equal( 0 );

		} );

	} );

	describe( '#length()', function () {

		it( 'should return the euclidean length of the vector', function () {

			const v1 = new Vector3( 2, 0, 0 );

			expect( v1.length() ).to.be.equal( 2 );

		} );

	} );

	describe( '#squaredLength()', function () {

		it( 'should return the squared euclidean length of the vector', function () {

			const v1 = new Vector3( 2, 0, 0 );

			expect( v1.squaredLength() ).to.be.equal( 4 );

		} );

	} );

	describe( '#manhattanLength()', function () {

		it( 'should return the manhattan length of the vector', function () {

			const v1 = new Vector3( 1, 1, 1 );

			expect( v1.manhattanLength() ).to.be.equal( 3 );

		} );

	} );

	describe( '#distanceTo()', function () {

		it( 'should return euclidean distance to the given vector', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.distanceTo( v1 ) ).to.be.equal( Math.sqrt( 3 ) );

		} );

	} );

	describe( '#squaredDistanceTo()', function () {

		it( 'should return squared euclidean distance to the given vector', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.squaredDistanceTo( v1 ) ).to.be.equal( 3 );

		} );

	} );

	describe( '#manhattanDistanceTo()', function () {

		it( 'should return the manhattan distance to the given vector', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.manhattanDistanceTo( v1 ) ).to.be.equal( 3 );

		} );

	} );

	describe( '#normalize()', function () {

		it( 'should normalize the vector', function () {

			const v2 = new Vector3( 4, 3, 0 );

			expect( v2.normalize() ).to.deep.equal( { x: 0.8, y: 0.6, z: 0 } );

		} );

	} );

	describe( '#applyMatrix4()', function () {

		it( 'should perform a vector-matrix multiplication with a 4x4 matrix', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const m1 = new Matrix4();

			m1.setPosition( new Vector3( 2, 5, 6 ) );
			m1.scale( new Vector3( 2, 2, 2 ) );

			expect( v1.applyMatrix4( m1 ) ).to.deep.equal( { x: 4, y: 7, z: 8 } );

		} );

	} );

	describe( '#applyRotation()', function () {

		it( 'should apply a rotation defined by a quaternion to the vector', function () {

			const q1 = new Quaternion( 0, 1, 0, 0 );
			const v1 = new Vector3( 1, 1, 1 );

			expect( v1.applyRotation( q1 ) ).to.deep.equal( { x: - 1, y: 1, z: - 1 } );

		} );

	} );

	describe( '#extractPositionFromMatrix()', function () {

		it( 'should extract the position portion of the given 4x4 matrix and store it in this 3D vector', function () {

			const m1 = new Matrix4();
			m1.elements[ 12 ] = 1;
			m1.elements[ 13 ] = 2;
			m1.elements[ 14 ] = 3;

			const v1 = new Vector3().extractPositionFromMatrix( m1 );

			expect( v1 ).to.deep.equal( { x: 1, y: 2, z: 3 } );

		} );

	} );

	describe( '#transformDirection()', function () {

		it( 'should transform this direction vector by the given 4x4 matrix', function () {

			const v1 = new Vector3( 2, 2, 1 ).normalize();
			const q1 = new Quaternion().fromEuler( Math.PI / 2, 0, 0 );
			const m1 = new Matrix4().fromQuaternion( q1 );

			v1.transformDirection( m1 );

			expect( v1.x ).to.closeTo( 0.6666666666666667, Number.EPSILON );
			expect( v1.y ).to.closeTo( - 0.3333333333333332, Number.EPSILON );
			expect( v1.z ).to.closeTo( 0.6666666666666667, Number.EPSILON );

		} );

	} );

	describe( '#fromMatrix3Column()', function () {

		it( 'should set the values of a vector from the given 3x3 matrix column', function () {

			const m1 = new Matrix3();

			expect( new Vector3().fromMatrix3Column( m1, 0 ) ).to.deep.equal( { x: 1, y: 0, z: 0 } );

		} );

	} );

	describe( '#fromMatrix4Column()', function () {

		it( 'should set the values of a vector from the given 4x4 matrix column', function () {

			const m1 = new Matrix4();

			expect( new Vector3().fromMatrix4Column( m1, 0 ) ).to.deep.equal( { x: 1, y: 0, z: 0 } );

		} );

	} );

	describe( '#fromSpherical()', function () {

		it( 'should produce a vector from the given spherical coordinates', function () {

			const a = new Vector3();
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;
			const radius = 10;

			a.fromSpherical( radius, phi, theta );
			expect( a.x ).to.closeTo( - 4.677914006701843, Number.EPSILON );
			expect( a.y ).to.closeTo( - 5.000000000000002, Number.EPSILON );
			expect( a.z ).to.closeTo( - 7.288149322420796, Number.EPSILON );


		} );

	} );

	describe( '#fromArray()', function () {

		it( 'should return vector from array', function () {

			const v1 = new Vector3().fromArray( [ x, y, z ] );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#toArray()', function () {

		it( 'should store all values of the vector in the given array', function () {

			const v1 = new Vector3( x, y, z );
			const array = [];

			v1.toArray( array );

			expect( array ).to.eql( [ x, y, z ] );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if the given vector is equal to the current instance', function () {

			const v1 = new Vector3();
			const v2 = new Vector3( 1, 1, 1 );

			expect( v1.equals( v1 ) ).to.be.true;
			expect( v2.equals( v1 ) ).to.be.false;

		} );

	} );

} );
