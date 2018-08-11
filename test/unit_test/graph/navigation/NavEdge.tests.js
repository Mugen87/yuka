/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const NavEdge = YUKA.NavEdge;

describe( 'NavEdge', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const edge = new NavEdge();
			expect( edge ).to.have.a.property( 'from' );
			expect( edge ).to.have.a.property( 'to' );
			expect( edge ).to.have.a.property( 'cost' ).that.is.equal( 0 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const edge = new NavEdge( 0, 1, 1 );
			expect( edge.from ).to.equal( 0 );
			expect( edge.to ).to.equal( 1 );
			expect( edge.cost ).to.equal( 1 );

		} );

	} );

} );
