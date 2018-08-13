/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const GraphUtils = YUKA.GraphUtils;

//

describe( 'GraphUtils', function () {

	describe( '#createGridLayout()', function () {

		it( 'should create a graph with a grid layout from the given parameters', function () {

			const size = 10;
			const segments = 10;

			const graph = GraphUtils.createGridLayout( size, segments );
			const count = graph._nodes.size;

			expect( count ).to.equal( ( segments + 1 ) * ( segments + 1 ) );

			const node0 = graph.getNode( 0 );
			const node1 = graph.getNode( count - 1 );

			const distance = node0.position.distanceTo( node1.position );

			expect( distance ).to.closeTo( Math.sqrt( ( size * size ) + ( size * size ) ), Number.EPSILON );

		} );

	} );

} );
