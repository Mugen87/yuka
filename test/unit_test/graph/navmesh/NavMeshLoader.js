/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const fetch = require( 'node-fetch' );
const TextDecoder = require( 'text-encoding' ).TextDecoder;

// provide implementation of browser APIs used in NavMeshLoader

global.fetch = fetch;
global.TextDecoder = TextDecoder;

const YUKA = require( '../../../../build/yuka.js' );

const NavMeshLoader = YUKA.NavMeshLoader;
const NavMesh = YUKA.NavMesh;

//

describe( 'NavMeshLoader', function () {

	describe( '#load()', function () {

		it( 'should return a promise that resolves if the navigation mesh with the given URL is successfully loaded', function ( done ) {

			const loader = new NavMeshLoader();

			loader.load( 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/gltf/navmesh.gltf' ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions.size ).is.equal( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 8 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 40 );

				done();

			} );

		} );

		it( 'should be able to load a glTF file with embedded buffer data', function ( done ) {

			const loader = new NavMeshLoader();

			loader.load( 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/gltf-embedded/navmesh.gltf' ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions.size ).is.equal( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 8 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 40 );

				done();

			} );

		} );

		it( 'should be able to load a glb file', function ( done ) {

			const loader = new NavMeshLoader();

			loader.load( 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb/navmesh.glb' ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions.size ).is.equal( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 8 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 40 );

				done();

			} );

		} );

		it( 'should be able to load a glb file with embedded buffer data', function ( done ) {

			const loader = new NavMeshLoader();

			loader.load( 'https://raw.githubusercontent.com/Mugen87/yuka/master/test/assets/navmesh/glb-embedded/navmesh.glb' ).then( ( navMesh ) => {

				expect( navMesh ).is.an.instanceof( NavMesh );
				expect( navMesh.regions.size ).is.equal( 5 );
				expect( navMesh.graph.getNodeCount() ).is.equal( 8 );
				expect( navMesh.graph.getEdgeCount() ).is.equal( 40 );

				done();

			} );

		} );

	} );

} );
