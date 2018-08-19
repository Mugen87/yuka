/**
 * @author robp94 / https://github.com/robp94
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const BFS = YUKA.BFS;
const Graph = YUKA.Graph;
const NavNode = YUKA.NavNode;
const GraphUtils = YUKA.GraphUtils;

describe( 'BFS', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const bfs = new BFS();
			expect( bfs ).to.have.a.property( 'graph' ).that.is.null;
			expect( bfs ).to.have.a.property( 'source' ).to.equal( - 1 );
			expect( bfs ).to.have.a.property( 'target' ).to.equal( - 1 );
			expect( bfs ).to.have.a.property( 'found' ).that.is.false;

			expect( bfs ).to.have.a.property( '_route' ).that.is.a( 'map' );
			expect( bfs ).to.have.a.property( '_visited' ).that.is.a( 'set' );
			expect( bfs ).to.have.a.property( '_spanningTree' ).that.is.a( 'set' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const graph = new Graph();
			const bfs = new BFS( graph, 0, 1 );

			expect( bfs.graph ).to.equal( graph );
			expect( bfs.source ).to.equal( 0 );
			expect( bfs.target ).to.equal( 1 );

		} );

	} );

	describe( '#search()', function () {

		it( 'should set its found flag to true if the search was successful (target node found)', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const bfs = new BFS( graph, 60, 104 );

			bfs.search();

			expect( bfs.found ).to.be.true;

		} );

		it( 'should set its found flag to false if the search was not successful (target node not found)', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			graph.addNode( new NavNode( 1000 ) ); // add a node with no edges
			const bfs = new BFS( graph, 60, 1000 );

			bfs.search();

			expect( bfs.found ).to.be.false;

		} );

	} );

	describe( '#getPath()', function () {

		it( 'should return an array of node indices which represent the found path', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const bfs = new BFS( graph, 60, 104 );

			const path = bfs.search().getPath();

			const firstNodeIndex = path[ 0 ];
			const secondNodeIndex = path[ path.length - 1 ];

			expect( path ).to.be.an( 'array' );
			expect( firstNodeIndex ).to.equal( 60 );
			expect( secondNodeIndex ).to.equal( 104 );

		} );

		it( 'should return an empty array if the search was not successful', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			graph.addNode( new NavNode( 1000 ) );
			const bfs = new BFS( graph, 60, 1000 );

			const path = bfs.search().getPath();

			expect( path ).to.be.an( 'array' ).that.is.empty;

		} );

	} );

	describe( '#getSearchTree()', function () {

		it( 'should return an array of edges representing the search tree/spanning tree', function () {

			const graph = GraphUtils.createGridLayout( 50, 10 );
			const bfs = new BFS( graph, 60, 104 );

			const searchTree = bfs.search().getSearchTree();

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
			const bfs = new BFS( graph, 60, 104 );

			bfs.search().clear();

			expect( bfs.found ).to.be.false;
			expect( bfs._route.size ).to.equal( 0 );
			expect( bfs._visited.size ).to.equal( 0 );
			expect( bfs._spanningTree.size ).to.equal( 0 );

		} );

	} );

} );
