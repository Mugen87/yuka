/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const ASTAR = YUKA.AStar;
const Graph = YUKA.Graph;
const GraphUtils = YUKA.GraphUtils;

describe( 'ASTAR', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const aStar = new ASTAR();
			expect( aStar ).to.have.a.property( 'graph' ).that.is.null;
			expect( aStar ).to.have.a.property( 'source' ).to.equal( - 1 );
			expect( aStar ).to.have.a.property( 'target' ).to.equal( - 1 );
			expect( aStar ).to.have.a.property( 'found' ).that.is.false;

			expect( aStar ).to.have.a.property( '_cost' ).that.is.a( 'map' );
			expect( aStar ).to.have.a.property( '_shortestPathTree' ).that.is.a( 'map' );
			expect( aStar ).to.have.a.property( '_searchFrontier' ).that.is.a( 'map' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const graph = new Graph();
			const aStar = new ASTAR( graph, 0, 1 );

			expect( aStar.graph ).to.equal( graph );
			expect( aStar.source ).to.equal( 0 );
			expect( aStar.target ).to.equal( 1 );

		} );

	} );

	describe( '#search()', function () {

		it( 'should set its found flag to true if the search was successful (target node found)', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const aStar = new ASTAR( graph, 60, 104 );

			aStar.search();

			expect( aStar.found ).to.be.true;

		} );
		//for performance reasons ignore non successful like -1

	} );

	describe( '#getPath()', function () {

		it( 'should return an array of node indices which represent the found path', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const aStar = new ASTAR( graph, 60, 104 );

			const path = aStar.search().getPath();

			const firstNodeIndex = path[ 0 ];
			const secondNodeIndex = path[ path.length - 1 ];

			expect( path ).to.be.an( 'array' );
			expect( firstNodeIndex ).to.equal( 60 );
			expect( secondNodeIndex ).to.equal( 104 );

		} );
		//for performance reasons ignore non successful like -1

	} );

	describe( '#getSearchTree()', function () {

		it( 'should return an array of edges representing the search tree/spanning tree', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const aStar = new ASTAR( graph, 60, 104 );

			const searchTree = aStar.search().getSearchTree();

			const firstEdge = searchTree[ 0 ];
			const lastEdge = searchTree[ searchTree.length - 1 ];

			expect( searchTree ).to.be.an( 'array' );
			expect( firstEdge.from ).to.equal( 60 );
			expect( lastEdge.to ).to.equal( 104 );

		} );

	} );

	describe( '#SetHeuristic()', function () {

		it( 'should set the given heuristic', function () {

			const aStar = new ASTAR();
			aStar.setHeuristic( YUKA.HeuristicPolicyEuclidSquared );

			expect( aStar.heuristic ).to.be.equal( YUKA.HeuristicPolicyEuclidSquared );
			expect( aStar.heuristic ).to.be.not.equal( YUKA.HeuristicPolicyEuclid );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the internal data structures', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const aStar = new ASTAR( graph, 60, 104 );

			aStar.search().clear();
			expect( aStar.found ).to.be.false;
			expect( aStar._cost.size ).to.equal( 0 );
			expect( aStar._shortestPathTree.size ).to.equal( 0 );
			expect( aStar._searchFrontier.size ).to.equal( 0 );

		} );

	} );


} );
