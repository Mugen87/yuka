/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const HeuristicPolicyEuclid = YUKA.HeuristicPolicyEuclid;
const HeuristicPolicyEuclidSquared = YUKA.HeuristicPolicyEuclidSquared;
const HeuristicPolicyManhattan = YUKA.HeuristicPolicyManhattan;
const HeuristicPolicyDijkstra = YUKA.HeuristicPolicyDijkstra;

const Graph = YUKA.Graph;
const NavNode = YUKA.NavNode;
const Vector3 = YUKA.Vector3;

// graph setup

const graph = new Graph();
const navNode1 = new NavNode( 0, new Vector3( 1, 1, 1 ) );
const navNode2 = new NavNode( 1, new Vector3( 1, 3, 1 ) );

graph.addNode( navNode1 );
graph.addNode( navNode2 );

//

describe( 'HeuristicPolicyEuclid', function () {

	describe( '#calculate()', function () {

		it( 'should calculate a heuristic value based on the euclidean distance between two nav nodes', function () {

			const value = HeuristicPolicyEuclid.calculate( graph, 0, 1 );

			expect( value ).to.equal( 2 );

		} );

	} );

} );

describe( 'HeuristicPolicyEuclidSquared', function () {

	describe( '#calculate()', function () {

		it( 'should calculate a heuristic value based on the squared euclidean distance between two nav nodes', function () {

			const value = HeuristicPolicyEuclidSquared.calculate( graph, 0, 1 );

			expect( value ).to.equal( 4 );

		} );

	} );

} );

describe( 'HeuristicPolicyManhattan', function () {

	describe( '#calculate()', function () {

		it( 'should calculate a heuristic value based on the manhattan distance between two nav nodes', function () {

			const value = HeuristicPolicyManhattan.calculate( graph, 0, 1 );

			expect( value ).to.equal( 2 );

		} );

	} );

} );

describe( 'HeuristicPolicyDijkstra', function () {

	describe( '#calculate()', function () {

		it( 'should always return zero since this heuristic produces dijkstra outcome', function () {

			const value = HeuristicPolicyDijkstra.calculate( graph, 0, 1 );

			expect( value ).to.equal( 0 );

		} );

	} );

} );
