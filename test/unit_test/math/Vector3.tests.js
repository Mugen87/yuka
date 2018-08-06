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

		it( 'should return a copy of the vector', function () {

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

		it( 'should return an unaltered vector when a zero vector is added', function () {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3();
			v1.add( v0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

		it( 'should return a vector twice the size if the same vector is added', function () {

			const v1 = new Vector3( x, y, z );
			v1.add( v1 );

			expect( v1 ).to.deep.equal( { x: x * 2, y: y * 2, z: z * 2 } );

		} );

	} );

	describe( '#addScalar()', function () {

		it( 'should return an unaltered vector when adding 0', function () {

			const v1 = new Vector3( x, y, z );
			v1.addScalar( 0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#addVectors()', function () {

		it( 'should return the same vector when a zero vector is added', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3();
			const v2 = new Vector3().addVectors( v1, v0 );

			expect( v2 ).to.deep.equal( { x: v1.x, y: v1.y, z: v1.z } );

		} );

		it( 'should return a vector twice the size if the same vector is added', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3().addVectors( v1, v1 );

			expect( v2 ).to.deep.equal( { x: v1.x * 2, y: v1.y * 2, z: v1.z * 2 } );

		} );

	} );

	describe( '#sub', function () {

		it( 'should return zero vector when same vector is subtracted', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3();

			v1.sub( v1 );

			expect( v1 ).to.deep.equal( { x: v2.x, y: v2.y, z: v2.z } );

		} );

	} );

	describe( '#subScalar()', function () {

		it( 'should return an unaltered vector when subbing 0', function () {

			const v1 = new Vector3( x, y, z );
			v1.subScalar( 0 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#subVectors()', function () {

		it( 'should return the same vector when a zero vector is subbed', function ( ) {

			const v1 = new Vector3( x, y, z );
			const v0 = new Vector3();
			const v2 = new Vector3().subVectors( v1, v0 );

			expect( v2 ).to.deep.equal( { x: v1.x, y: v1.y, z: v1.z } );

		} );

	} );

	describe( '#multiply()', function () {

		it( 'should return product of vector multiplication', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( x, y, z );

			v1.multiply( v2 );

			expect( v1 ).to.deep.equal( { x: Math.pow( v2.x, 2 ), y: Math.pow( v2.y, 2 ), z: Math.pow( v2.z, 2 ) } );

		} );

	} );

	describe( '#multiplyScalar()', function () {

		it( 'should return unaltered vector when multiplying with 1', function () {

			const v1 = new Vector3( x, y, z );
			v1.multiplyScalar( 1 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#multiplyVectors()', function () {

		it( 'should return product of vector multiplication', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3().multiplyVectors( v1, v1 );

			expect( v2 ).to.deep.equal( { x: Math.pow( v1.x, 2 ), y: Math.pow( v1.y, 2 ), z: Math.pow( v1.z, 2 ) } );

		} );

	} );

	describe( '#divide()', function () {

		it( 'should return unaltered vector when dividing with vector1', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( 1, 1, 1 );

			v1.divide( v2 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#divideScalar()', function () {

		it( 'should return unaltered vector when dividing with 1', function () {

			const v1 = new Vector3( x, y, z );

			v1.divideScalar( 1 );

			expect( v1 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#divideVectors()', function () {

		it( 'should return unaltered vector when dividing with vector1', function () {

			const v1 = new Vector3( x, y, z );
			const v2 = new Vector3( 1, 1, 1 );
			const v3 = new Vector3().divideVectors( v1, v2 );


			expect( v3 ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );

	describe( '#clamp()', function () {

		it( 'vector should be between min and max', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );
			const v2 = new Vector3( 2, - 1, 1 );

			v2.clamp( v0, v1 );
			expect( v2 ).to.deep.equal( { x: 1, y: 0, z: 1 } );

		} );

	} );

	describe( '#dot()', function () {

		it( 'should return dot product', function () {

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

		it( 'should return cross product', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const v2 = new Vector3( 2, - 1, 0.5 );

			v1.cross( v2 );
			expect( v1 ).to.deep.equal( { x: 1.5, y: 1.5, z: - 3 } );

		} );

		it( 'should return a degenarted zero vector if both vectors are coplanar', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 2, 0 );

			v1.cross( v2 );
			expect( v1 ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#crossVectors', function () {

		it( 'should return cross product', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const v2 = new Vector3( 2, - 1, 0.5 );
			const v3 = new Vector3().crossVectors( v1, v2 );

			expect( v3 ).to.deep.equal( { x: 1.5, y: 1.5, z: - 3 } );

		} );

		it( 'should return a degenarted zero vector if both vectors are coplanar', function () {

			const v1 = new Vector3( 0, 1, 0 );
			const v2 = new Vector3( 0, 2, 0 );
			const v3 = new Vector3().crossVectors( v1, v2 );

			expect( v3 ).to.deep.equal( { x: 0, y: 0, z: 0 } );

		} );

	} );

	describe( '#angleTo()', function () {

		it( 'should return angle to the Vector', function () {

			const v1 = new Vector3( 1, 0, 0 );
			const v2 = new Vector3( 0, 1, 0 );

			expect( v1.angleTo( v1 ) ).to.be.equal( 0 );
			expect( v1.angleTo( v2 ) ).to.be.equal( Math.PI / 2 );

		} );

	} );

	describe( '#length()', function () {

		it( 'should return length of Vector', function () {

			const v1 = new Vector3( 2, 0, 0 );

			expect( v1.length() ).to.be.equal( 2 );

		} );

	} );

	describe( '#squaredLength()', function () {

		it( 'should return squared length of vector', function () {

			const v1 = new Vector3( 2, 0, 0 );

			expect( v1.squaredLength() ).to.be.equal( 4 );

		} );

	} );

	describe( '#manhattanLength()', function () {

		it( 'should return manhattan length of vector', function () {

			const v1 = new Vector3( 1, 1, 1 );

			expect( v1.manhattanLength() ).to.be.equal( 3 );

		} );

	} );

	describe( '#distanceTo()', function () {

		it( 'should return distance to the vector', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.distanceTo( v1 ) ).to.be.equal( Math.sqrt( 3 ) );

		} );

	} );

	describe( '#squaredDistanceTo()', function () {

		it( 'should return squared distance to the vector', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.squaredDistanceTo( v1 ) ).to.be.equal( 3 );

		} );

	} );

	describe( '#manhattanDistanceTo()', function () {

		it( 'should return manhattan distance to the vector', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.manhattanDistanceTo( v1 ) ).to.be.equal( 3 );

		} );

	} );

	describe( '#normalize()', function () {

		it( 'should return normalized vector', function () {

			const v2 = new Vector3( 4, 3, 0 );

			expect( v2.normalize() ).to.deep.equal( { x: 0.8, y: 0.6, z: 0 } );

		} );

	} );

	describe( '#applyMatrix4()', function () {

		it( 'should apply matrix4 to vector', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const m1 = new Matrix4();

			m1.setPosition( new Vector3( 2, 5, 6 ) );
			m1.scale( new Vector3( 2, 2, 2 ) );

			expect( v1.applyMatrix4( m1 ) ).to.deep.equal( { x: 4, y: 7, z: 8 } );

		} );

	} );

	describe( '#applyRotation()', function () {

		it( 'should apply rotation to vector', function () {

			const m1 = new Quaternion( 0, 1, 0, 0 );
			const v1 = new Vector3( 1, 1, 1 );

			expect( v1.applyRotation( m1 ) ).to.deep.equal( { x: - 1, y: 1, z: - 1 } );

		} );

	} );

	describe( '#fromMatrix3Column()', function () {

		it( 'should return vector from matrix column', function () {

			const m1 = new Matrix3();

			expect( new Vector3().fromMatrix3Column( m1, 0 ) ).to.deep.equal( { x: 1, y: 0, z: 0 } );

		} );

	} );

	describe( '#fromMatrix4Column()', function () {

		it( 'should return vector from matrix column', function () {

			const m1 = new Matrix4();

			expect( new Vector3().fromMatrix4Column( m1, 0 ) ).to.deep.equal( { x: 1, y: 0, z: 0 } );

		} );

	} );

	describe( '#fromSpherical()', function () {

		it( 'should return vector from sphere', function () {

			const a = new Vector3();
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;
			const radius = 10;
			const expected = new Vector3( - 4.677914006701843, - 5.000000000000002, - 7.288149322420796 );

			expect( a.fromSpherical( radius, phi, theta ) ).to.deep.equal( { x: expected.x, y: expected.y, z: expected.z } );

		} );

	} );

	describe( '#fromArray()', function () {

		it( 'should return vector from array', function () {

			const arr = [ x, y, z ];
			const v1 = new Vector3();

			expect( v1.fromArray( arr ) ).to.deep.equal( { x: x, y: y, z: z } );

		} );

	} );
	describe( '#toArray()', function () {

		it( 'should return array with vector values', function () {

			const v0 = new Vector3();

			expect( v0.toArray() ).to.eql( [ 0, 0, 0 ] );

		} );

	} );

	describe( '#equals()', function () {

		it( 'should return true if equal else false', function () {

			const v0 = new Vector3();
			const v1 = new Vector3( 1, 1, 1 );

			expect( v0.equals( v0 ) ).to.be.true;
			expect( v0.equals( v1 ) ).to.be.false;

		} );

	} );

} );
