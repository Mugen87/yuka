/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Run benchmark via: node test/benchmarks/Dijkstra.benchmark.js
 *
 */

const Benchmark = require( 'benchmark' );
const YUKA = require( '../../build/yuka.js' );

const Dijkstra = YUKA.Dijkstra;
const GraphUtils = YUKA.GraphUtils;

// graph setup

const graphSmall = GraphUtils.createGridLayout( 100, 20 );
const graphMedium = GraphUtils.createGridLayout( 100, 50 );
const graphBig = GraphUtils.createGridLayout( 100, 75 );

// source and target node are selected to be far away in the graph

const suite = new Benchmark.Suite();

suite.add( 'Dijkstra#search(), small graph', function () {

	const graphSearch = new Dijkstra( graphSmall, 60, 425 );
	graphSearch.search();

} ).add( 'Dijkstra#search(), medium graph', function () {

	const graphSearch = new Dijkstra( graphMedium, 60, 2533 );
	graphSearch.search();

} ).add( 'Dijkstra#search(), big graph', function () {

	const graphSearch = new Dijkstra( graphBig, 60, 5320 );
	graphSearch.search();

} ).on( 'cycle', function ( event ) {

	console.log( String( event.target ) );

} ).run( { 'async': true } );
