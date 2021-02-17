/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const chai = require( 'chai' );
chai.use( require( 'chai-uuid' ) );
const expect = chai.expect;

const YUKA = require( '../../../build/yuka.js' );

const MathUtils = YUKA.MathUtils;
const Vector3 = YUKA.Vector3;

describe( 'Math', function () {

	describe( '#area()', function () {

		it( 'should return the indices of the maximum values of the given array', function () {

			const v1 = new Vector3( 0, 0, 0 );
			const v2 = new Vector3( 2, 0, 0 );
			const v3 = new Vector3( 2, 0, - 2 );

			expect( MathUtils.area( v1, v2, v3 ) ).to.equal( 4 );

		} );

	} );

	describe( '#argmax()', function () {

		it( 'should return the indices of the maximum values of the given array', function () {

			const values1 = [ 0, 1, 2, 3, 4, 5, 5, 4, 3, - 2, - 1, 5 ];
			const values2 = [];

			expect( MathUtils.argmax( values1 ) ).to.deep.equal( [ 5, 6, 11 ] );
			expect( MathUtils.argmax( values2 ) ).to.be.empty;

		} );

	} );

	describe( '#choice()', function () {

		it( 'should return a random sample from a given array assuming uniform distribution', function () {

			const values = [ 'a', 'b', 'c', 'd' ];

			expect( values ).to.include( MathUtils.choice( values ) );
			expect( values ).to.include( MathUtils.choice( values ) );
			expect( values ).to.include( MathUtils.choice( values ) );
			expect( values ).to.include( MathUtils.choice( values ) );

		} );

		it( 'should return a random sample from a given array assuming non-uniform distribution', function () {

			const values = [ 'a', 'b', 'c', 'd' ];

			const probabilities1 = [ 1, 0, 0, 0 ];
			const probabilities2 = [ 0, 1, 0, 0 ];
			const probabilities3 = [ 0, 0, 1, 0 ];
			const probabilities4 = [ 0, 0, 0, 1 ];

			expect( MathUtils.choice( values, probabilities1 ) ).to.equal( 'a' );
			expect( MathUtils.choice( values, probabilities2 ) ).to.equal( 'b' );
			expect( MathUtils.choice( values, probabilities3 ) ).to.equal( 'c' );
			expect( MathUtils.choice( values, probabilities4 ) ).to.equal( 'd' );

		} );

	} );

	describe( '#clamp()', function () {

		it( 'should clamp a number between two values', function () {

			expect( MathUtils.clamp( 4, 6, 8 ) ).to.deep.equal( 6 );
			expect( MathUtils.clamp( 7, 6, 8 ) ).to.deep.equal( 7 );
			expect( MathUtils.clamp( 10, 6, 8 ) ).to.deep.equal( 8 );

		} );

	} );

	describe( '#generateUUID()', function () {

		it( 'should return a RFC4122 Version 4 complied Universally Unique Identifier (UUID)', function () {

			const uuid = MathUtils.generateUUID();

			expect( uuid ).to.be.a.uuid( 'v4' );

		} );

	} );

	describe( '#randFloat()', function () {

		it( 'should return a random float between two float values', function () {

			expect( MathUtils.randFloat( 4, 6 ) ).to.be.within( 4, 6 );
			expect( MathUtils.randFloat( - 2, - 1 ) ).to.be.within( - 2, - 1 );

		} );

	} );

	describe( '#randInt()', function () {

		it( 'should return a random integer between two integer values', function () {

			let int = MathUtils.randInt( 4, 6 );

			expect( int ).to.be.within( 4, 6 );
			expect( int % 1 ).to.equal( 0 );

			int = MathUtils.randInt( - 2, 0 );

			expect( int ).to.be.within( - 2, 0 );
			expect( int % 1 ).to.equal( 0 );

		} );

	} );

} );
