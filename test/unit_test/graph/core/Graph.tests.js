/**
 * @author robp94 / https://github.com/robp94
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const GraphJSONs = require( '../../../files/GraphJSONs.js' );

const Node = YUKA.Node;
const Edge = YUKA.Edge;
const Graph = YUKA.Graph;

describe( 'Graph', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const graph = new Graph();
			expect( graph ).to.have.a.property( 'digraph' ).that.is.false;
			expect( graph ).to.have.a.property( '_nodes' ).that.is.a( 'map' );
			expect( graph ).to.have.a.property( '_edges' ).that.is.a( 'map' );

		} );

	} );

	describe( '#addNode()', function () {

		it( 'should add a node to the graph', function () {

			const graph = new Graph();
			const node = new Node( 0 );

			graph.addNode( node );
			expect( graph._nodes.size ).to.equal( 1 );
			expect( graph._nodes.get( node.index ) ).to.equal( node );
			expect( graph._edges.get( node.index ) ).that.is.an( 'array' );

		} );

	} );

	describe( '#addEdge()', function () {

		it( 'should add two edges to a non-directed graph', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const edge = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( edge );

			const edgesN0 = graph._edges.get( n0.index );
			const edgesN1 = graph._edges.get( n1.index );

			expect( edgesN0 ).to.have.lengthOf( 1 );
			expect( edgesN1 ).to.have.lengthOf( 1 );

		} );

		it( 'should add a single edge to a directed graph', function () {

			const graph = new Graph();
			graph.digraph = true;
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const edge = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( edge );

			const edgesN0 = graph._edges.get( n0.index );
			const edgesN1 = graph._edges.get( n1.index );

			expect( edgesN0 ).to.have.lengthOf( 1 );
			expect( edgesN1 ).to.have.lengthOf( 0 );

		} );

	} );

	describe( '#hasNode()', function () {

		it( 'should return true if the graph has a node for the given index ', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );

			graph.addNode( n0 );

			expect( graph.hasNode( n0.index ) ).to.be.true;
			expect( graph.hasNode( 1 ) ).to.be.false;

		} );

	} );

	describe( '#hasEdge()', function () {

		it( 'should return true if the graph has an edge for the given indices', function () {

			const graph = new Graph();
			graph.digraph = true;
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );
			const edge = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );
			graph.addEdge( edge );

			expect( graph.hasEdge( 0, 1 ) ).to.be.true;
			expect( graph.hasEdge( 0, 2 ) ).to.be.false;
			expect( graph.hasEdge( 0, 3 ) ).to.be.false;

		} );

	} );

	describe( '#getNode()', function () {

		it( 'should return the node for the given index', function () {

			const graph = new Graph();
			const node = new Node( 0 );

			graph.addNode( node );

			expect( graph.getNode( node.index ) ).to.equal( node );

		} );

		it( 'should return null if the node does not exist', function () {

			const graph = new Graph();

			expect( graph.getNode( 0 ) ).to.be.null;

		} );

	} );

	describe( '#getEdge()', function () {

		it( 'should return the edge for the given node indices (from, to)', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );
			const e0 = new Edge( 0, 1 );
			const e1 = new Edge( 0, 2 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );

			expect( graph.getEdge( 0, 2 ) ).to.equal( e1 );

		} );

		it( 'should return null when the given node indices are not found', function () {

			const graph = new Graph();

			expect( graph.getEdge( 0, 1 ) ).to.be.null;

		} );

		it( 'should return null if the edge does not exists', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );

			expect( graph.getEdge( 0, 1 ) ).to.be.null;

		} );

	} );

	describe( '#getNodes()', function () {

		it( 'should fill all nodes of the graph into the given array', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );

			const nodes = [];

			graph.getNodes( nodes );

			expect( nodes ).to.have.lengthOf( 3 );
			expect( nodes[ 0 ] ).to.equal( n0 );
			expect( nodes[ 1 ] ).to.equal( n1 );
			expect( nodes[ 2 ] ).to.equal( n2 );

		} );

		it( 'should set the length of the given array to zero before filling', function () {

			const graph = new Graph();

			const nodes = [ 1, 2, 3 ];

			graph.getNodes( nodes );

			expect( nodes ).to.be.empty;

		} );

	} );

	describe( '#getEdgesOfNode()', function () {

		it( 'should fill the edges of the adjacency list for the given node index to the given array', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );
			const e0 = new Edge( 0, 1 );
			const e1 = new Edge( 0, 2 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );

			graph.addEdge( e0 );
			graph.addEdge( e1 );

			const edges = [];

			graph.getEdgesOfNode( 0, edges );

			expect( edges ).to.have.lengthOf( 2 );
			expect( edges[ 0 ] ).to.equal( e0 );
			expect( edges[ 1 ] ).to.equal( e1 );

		} );

		it( 'should not alter the given array if the given node index does not exists', function () {

			const graph = new Graph();

			const edges = [ 1 ];
			graph.getEdgesOfNode( 0, edges );

			expect( edges[ 0 ] ).to.equal( 1 );

		} );

		it( 'should set the length of the given array to zero before filling', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );

			graph.addNode( n0 );

			const edges = [ 1, 2, 3 ];
			graph.getEdgesOfNode( 0, edges );

			expect( edges ).to.be.empty;

		} );

	} );

	describe( '#getNodeCount()', function () {

		it( 'should return the count of nodes', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );

			graph.addNode( n0 );

			expect( graph.getNodeCount() ).to.equal( 1 );

		} );

	} );

	describe( '#getEdgeCount()', function () {

		it( 'should return the count of edges', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const e0 = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( e0 );

			expect( graph.getEdgeCount() ).to.equal( 2 ); // non-directed graph

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the internal data structures of the graph', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const e0 = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( e0 );

			graph.clear();

			expect( graph._nodes.size ).to.be.equal( 0 );
			expect( graph._edges.size ).to.be.equal( 0 );

		} );

	} );

	describe( '#removeNode()', function () {

		it( 'should remove the given node from a non-directed graph', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );
			const e0 = new Edge( 1, 2 );
			const e1 = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );

			graph.removeNode( n0 );

			expect( graph.hasNode( n0.index ) ).to.be.false;
			expect( graph.hasEdge( e1.from, e1.to ) ).to.be.false;
			expect( graph.hasEdge( e1.to, e1.from ) ).to.be.false;

		} );

		it( 'should remove the given node from a directed graph', function () {

			const graph = new Graph();
			graph.digraph = true;
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );
			const e0 = new Edge( 0, 1 );
			const e1 = new Edge( 2, 0 );
			const e2 = new Edge( 2, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );
			graph.addEdge( e2 );

			graph.removeNode( n0 );

			expect( graph.hasNode( n0.index ) ).to.be.false;
			expect( graph.hasEdge( e0.from, e0.to ) ).to.be.false;
			expect( graph.hasEdge( e1.from, e1.to ) ).to.be.false;

		} );

	} );

	describe( '#removeEdge()', function () {

		it( 'should remove the given edge from the graph', function () {

			const graph = new Graph();
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const n2 = new Node( 2 );
			const e0 = new Edge( 1, 2 );
			const e1 = new Edge( 0, 1 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addNode( n2 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );

			graph.removeEdge( e1 );

			expect( graph.hasEdge( e1.from, e1.to ) ).to.be.false;
			expect( graph.hasEdge( e1.to, e1.from ) ).to.be.false;

		} );

		it( 'should do nothing if the respective adjacency list does not exist', function () {

			const graph = new Graph();
			const e0 = new Edge( 0, 1 );

			graph.removeEdge( e0 );

			expect( graph.hasEdge( e0.from, e0.to ) ).to.be.false;

		} );

		it( 'should remove only the given edge and not the opponent if it is a directed graph', function () {

			const graph = new Graph();
			graph.digraph = true;
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const e0 = new Edge( 0, 1 );
			const e1 = new Edge( 1, 0 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );

			graph.removeEdge( e0 );

			expect( graph.hasEdge( e0.from, e0.to ) ).to.be.false;
			expect( graph.hasEdge( e1.from, e1.to ) ).to.be.true;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const graph = new Graph();
			graph.digraph = true;
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const e0 = new Edge( 0, 1 );
			const e1 = new Edge( 1, 0 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );

			const json = graph.toJSON();

			expect( json ).to.deep.equal( GraphJSONs.Graph );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const graph = new Graph();
			graph.digraph = true;
			const n0 = new Node( 0 );
			const n1 = new Node( 1 );
			const e0 = new Edge( 0, 1 );
			const e1 = new Edge( 1, 0 );

			graph.addNode( n0 );
			graph.addNode( n1 );
			graph.addEdge( e0 );
			graph.addEdge( e1 );

			const graph2 = new Graph().fromJSON( GraphJSONs.Graph );


			expect( graph2 ).to.deep.equal( graph );

		} );

	} );

} );
