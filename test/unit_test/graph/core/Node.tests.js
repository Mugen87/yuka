/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const GraphJSONs = require( '../../../files/GraphJSONs.js' );

const Node = YUKA.Node;

describe( 'Node', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const node = new Node();
			expect( node ).to.have.a.property( 'index' ).that.is.equal( - 1 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const node = new Node( 1 );
			expect( node.index ).to.equal( 1 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const node = new Node();

			const json = node.toJSON();

			expect( json ).to.deep.equal( GraphJSONs.Node );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const node = new Node();
			const node2 = new Node( 1 ).fromJSON( GraphJSONs.Node );


			expect( node2 ).to.deep.equal( node );

		} );

	} );

} );
