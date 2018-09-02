/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const Dijkstra = YUKA.Dijkstra;
const Graph = YUKA.Graph;
const NavNode = YUKA.NavNode;
const NavEdge = YUKA.NavEdge;
const GraphUtils = YUKA.GraphUtils;


describe( 'DIJKSTRA', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const dijkstra = new Dijkstra();
			expect( dijkstra ).to.have.a.property( 'graph' ).that.is.null;
			expect( dijkstra ).to.have.a.property( 'source' ).to.equal( - 1 );
			expect( dijkstra ).to.have.a.property( 'target' ).to.equal( - 1 );
			expect( dijkstra ).to.have.a.property( 'found' ).that.is.false;

			expect( dijkstra ).to.have.a.property( '_cost' ).that.is.a( 'map' );
			expect( dijkstra ).to.have.a.property( '_shortestPathTree' ).that.is.a( 'map' );
			expect( dijkstra ).to.have.a.property( '_searchFrontier' ).that.is.a( 'map' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const graph = new Graph();
			const dijkstra = new Dijkstra( graph, 0, 1 );

			expect( dijkstra.graph ).to.equal( graph );
			expect( dijkstra.source ).to.equal( 0 );
			expect( dijkstra.target ).to.equal( 1 );

		} );

	} );

	describe( '#search()', function () {

		it( 'should set its found flag to true if the search was successful (target node found)', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const dijkstra = new Dijkstra( graph, 60, 104 );

			dijkstra.search();

			expect( dijkstra.found ).to.be.true;

		} );

		it( 'should set its found flag to false if the search was not successful (target node not found)', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			graph.addNode( new NavNode( 1000 ) ); // add a node with no edges
			const dijkstra = new Dijkstra( graph, 60, 1000 );

			dijkstra.search();

			expect( dijkstra.found ).to.be.false;

		} );

		it( 'should skip the processing of a node if the shortest path tree already has the given node', function () {

			const graph = new Graph();
			const n0 = new NavNode( 0 );
			const n1 = new NavNode( 1 );
			const n2 = new NavNode( 2 );
			const n3 = new NavNode( 3 );
			const n4 = new NavNode( 4 );

			const e0 = new NavEdge( 0, 1, 2 );
			const e1 = new NavEdge( 0, 2, 3 );
			const e2 = new NavEdge( 1, 2, 0.5 );
			const e3 = new NavEdge( 2, 3, 2 );
			const e4 = new NavEdge( 3, 4, 10 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );
			graph.addNode( n3 );
			graph.addNode( n4 );

			graph.addEdge( e0 );
			graph.addEdge( e1 );
			graph.addEdge( e2 );
			graph.addEdge( e3 );
			graph.addEdge( e4 );

			const dijkstra = new Dijkstra( graph, 0, 4 );

			dijkstra.search();

			expect( dijkstra.found ).to.be.true;

		} );

	} );

	describe( '#getPath()', function () {

		it( 'should return an array of node indices which represent the found path', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const dijkstra = new Dijkstra( graph, 60, 104 );

			const path = dijkstra.search().getPath();

			const firstNodeIndex = path[ 0 ];
			const secondNodeIndex = path[ path.length - 1 ];

			expect( path ).to.be.an( 'array' );
			expect( firstNodeIndex ).to.equal( 60 );
			expect( secondNodeIndex ).to.equal( 104 );

		} );

		it( 'should return an empty array if the search was not successful', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			graph.addNode( new NavNode( 1000 ) );
			const dijkstra = new Dijkstra( graph, 60, 1000 );

			const path = dijkstra.search().getPath();

			expect( path ).to.be.an( 'array' ).that.is.empty;

		} );

	} );

	describe( '#getSearchTree()', function () {

		it( 'should return an array of edges representing the search tree/spanning tree', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const dijkstra = new Dijkstra( graph, 60, 104 );

			const searchTree = dijkstra.search().getSearchTree();

			const firstEdge = searchTree[ 0 ];
			const lastEdge = searchTree[ searchTree.length - 1 ];

			expect( searchTree ).to.be.an( 'array' );
			expect( firstEdge.from ).to.equal( 60 );
			expect( lastEdge.to ).to.equal( 104 );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the internal data structures', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const dijkstra = new Dijkstra( graph, 60, 104 );

			dijkstra.search().clear();
			expect( dijkstra.found ).to.be.false;
			expect( dijkstra._cost.size ).to.equal( 0 );
			expect( dijkstra._shortestPathTree.size ).to.equal( 0 );
			expect( dijkstra._searchFrontier.size ).to.equal( 0 );

		} );

	} );


} );
