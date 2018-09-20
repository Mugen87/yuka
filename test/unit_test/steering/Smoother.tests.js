/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Smoother = YUKA.Smoother;
const Vector3 = YUKA.Vector3;

describe( 'Smoother', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const smoother = new Smoother();
			expect( smoother ).to.have.a.property( 'count' ).that.is.equal( 10 );
			expect( smoother ).to.have.a.property( '_history' ).that.is.an.instanceof( Array ).and.has.a.lengthOf( 10 );
			expect( smoother ).to.have.a.property( '_slot' ).that.is.equal( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const smoother = new Smoother( 20 );
			expect( smoother.count ).to.equal( 20 );
			expect( smoother._history ).to.have.lengthOf( 20 );

		} );

	} );

	describe( '#update()', function () {

		it( 'should use the given value to compute an average based on the internal history and store the result in the given vector', function () {

			const smoother = new Smoother( 3 );
			const result = new Vector3();

			smoother.update( new Vector3( 0, 0, 3 ), result );
			expect( result ).to.deep.equal( new Vector3( 0, 0, 1 ) );

			smoother.update( new Vector3( 0, 0, 3 ), result );
			expect( result ).to.deep.equal( new Vector3( 0, 0, 2 ) );

			smoother.update( new Vector3( 0, 0, 6 ), result );
			expect( result ).to.deep.equal( new Vector3( 0, 0, 4 ) );

			smoother.update( new Vector3( 0, 0, 9 ), result ); // the first update (0,0,3) will be overwritten
			expect( result ).to.deep.equal( new Vector3( 0, 0, 6 ) );

		} );

	} );

} );
