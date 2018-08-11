/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const NavNode = YUKA.NavNode;
const Vector3 = YUKA.Vector3;

describe( 'NavNode', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const node = new NavNode();
			expect( node ).to.have.a.property( 'index' ).that.is.equal( - 1 );
			expect( node ).to.have.a.property( 'position' ).that.is.an.instanceof( Vector3 );
			expect( node ).to.have.a.property( 'userData' ).that.is.a( 'object' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const node = new NavNode( 1, new Vector3( 1, 0, 1 ), { data: 'test' } );
			expect( node.index ).to.equal( 1 );
			expect( node.position ).to.deep.equal( { x: 1, y: 0, z: 1 } );
			expect( node.userData ).to.deep.equal( { data: 'test' } );

		} );

	} );

} );
