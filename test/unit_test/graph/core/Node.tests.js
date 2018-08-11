/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

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

} );
