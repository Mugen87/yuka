/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const GraphJSONs = require( '../../../files/GraphJSONs.js' );

const Edge = YUKA.Edge;

describe( 'Edge', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const edge = new Edge();
			expect( edge ).to.have.a.property( 'from' ).that.is.equal( - 1 );
			expect( edge ).to.have.a.property( 'to' ).that.is.equal( - 1 );
			expect( edge ).to.have.a.property( 'cost' ).that.is.equal( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const edge = new Edge( 0, 1, 1 );
			expect( edge.from ).to.equal( 0 );
			expect( edge.to ).to.equal( 1 );
			expect( edge.cost ).to.equal( 1 );

		} );

	} );

	describe( '#copy()', function () {

		it( 'should copy a given edge to the current instance', function () {

			const edge1 = new Edge();
			const edge2 = new Edge( 1, 2, 1 );

			edge1.copy( edge2 );

			expect( edge1 ).to.deep.equal( edge2 );

		} );

	} );

	describe( '#clone()', function () {

		it( 'should return a clone of the current instance', function () {

			const edge1 = new Edge( 1, 2, 1 );
			const edge2 = edge1.clone();

			expect( edge1 ).to.not.equal( edge2 ); // true clone
			expect( edge1 ).to.deep.equal( edge2 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const edge = new Edge();

			const json = edge.toJSON();

			expect( json ).to.deep.equal( GraphJSONs.Edge );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const edge = new Edge();
			const edge2 = new Edge( 1, 1, 1 ).fromJSON( GraphJSONs.Edge );


			expect( edge2 ).to.deep.equal( edge );

		} );

	} );

} );
