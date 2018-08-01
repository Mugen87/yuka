const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.min.js' );

const Vector3 = YUKA.Vector3;

describe( 'Vector3', function () {

	describe( '#add()', function () {

		it( 'should return an unaltered vector when a zero vector is added', function () {

			const v1 = new Vector3( 1, 1, 1 );
			const v0 = new Vector3();
			v1.add( v0 );

			expect( v1 ).to.deep.equal( { x: 1, y: 1, z: 1 } );

		} );

		it( 'should return a vector twice the size if the same vector is added', function () {

			const v1 = new Vector3( 1, 1, 1 );
			v1.add( v1 );

			expect( v1 ).to.deep.equal( { x: 2, y: 2, z: 2 } );

		} );

	} );

} );
